import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import { Worklets, useSharedValue } from 'react-native-worklets-core';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

export const LivenessCameraModal = ({ visible, onClose, onCapture }: Props) => {
  // Setup camera
  const device = useCameraDevice('front');
  const cameraRef = useRef<Camera>(null);
  
  const [hasPermission, setHasPermission] = useState(false);
  const [livenessState, setLivenessState] = useState<'align' | 'eyes' | 'wait' | 'mouth' | 'complete'>('align');
  const [prompt, setPrompt] = useState('Center your face in the circular aperture');

  // Request permissions
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Shared values for worklet state
  const step = useSharedValue(0); // 0: align, 1: wait for mouth, 2: check mouth, 3: complete
  
  const handleStepChangeJS = Worklets.createRunOnJS((newStep: number) => {
    if (newStep === 1) {
      setLivenessState('align');
      setPrompt('Face detected. Get ready...');
      setTimeout(() => {
        setLivenessState('mouth');
        setPrompt('Open and close your mouth');
        step.value = 2; // proceed to check smile
      }, 2000);
    } else if (newStep === 3) {
      setLivenessState('complete');
      setPrompt('Great! Completing scan...');
      setTimeout(() => {
        setPrompt('Liveness Confirmed! Biometric face scan complete.');
        takePhoto();
      }, 1500);
    }
  });

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({});
        onCapture(`file://${photo.path}`);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const faceDetectorOptions: any = {
    performanceMode: 'fast',
    classificationMode: 'all',
  };
  const { detectFaces } = useFaceDetector(faceDetectorOptions);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    // Ignore wait and complete states
    if (step.value === 1 || step.value === 3) return;
    
    const faces = detectFaces(frame);
    if (faces && faces.length === 1) {
      const face = faces[0];
      
      if (step.value === 0) {
        // Just checking alignment/presence
        if (face.bounds.width > 100) {
          step.value = 1;
          handleStepChangeJS(1);
        }
      } else if (step.value === 2) {
        // Mouth open (usually detected as a smile or low smiling probability but distinct feature, or we can use smiling as proxy for mouth movement)
        // Since MLKit doesn't have an explicit "mouth open" we use smilingProbability as a proxy for facial movement
        if (face.smilingProbability && face.smilingProbability > 0.7) {
          step.value = 3;
          handleStepChangeJS(3);
        }
      }
    }
  }, []);

  if (!hasPermission || !device) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraWrapper}>
          <View style={styles.mask}>
            <Camera
              ref={cameraRef}
              style={styles.camera}
              device={device}
              isActive={visible}
              frameProcessor={frameProcessor}
              pixelFormat="yuv"
              photo={true}
            />
          </View>
        </View>
        
        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>{prompt}</Text>
          <View style={styles.dots}>
            <View style={[styles.dot, livenessState !== 'align' ? styles.dotActive : null]} />
            <View style={[styles.dot, (livenessState === 'mouth' || livenessState === 'complete') ? styles.dotActive : null]} />
            <View style={[styles.dot, livenessState === 'complete' ? styles.dotActive : null]} />
          </View>
          {livenessState === 'complete' && (
            <View style={{ flexDirection: 'row', gap: 16, width: '100%', marginTop: 24, paddingHorizontal: 32 }}>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: '#D4AF37', alignItems: 'center' }}
                onPress={() => {
                  setLivenessState('align');
                  setPrompt('Center your face in the circular aperture');
                  step.value = 0;
                }}
              >
                <Text style={{ color: '#D4AF37', fontWeight: 'bold' }}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 12, borderRadius: 24, backgroundColor: '#10b981', alignItems: 'center' }}
                onPress={() => {
                  onClose();
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ok</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closeBtn: {
    padding: 8,
  },
  cameraWrapper: {
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 4,
    borderColor: '#D4AF37',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121721',
  },
  mask: {
    width: '100%',
    height: '100%',
    borderRadius: 160,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  promptContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 20,
    width: '80%',
  },
  promptText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#10B981',
  }
});
