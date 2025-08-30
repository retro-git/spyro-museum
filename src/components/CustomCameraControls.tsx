import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CustomCameraControlsProps {
  movementSpeed?: number;
  lookSpeed?: number;
  upVector?: THREE.Vector3;
}

export function CustomCameraControls({ 
  movementSpeed = 3, 
  lookSpeed = 0.01,
  upVector = new THREE.Vector3(0, 1, 0)
}: CustomCameraControlsProps) {
  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [isMovingForward, setIsMovingForward] = useState(false);
  const [isMovingBackward, setIsMovingBackward] = useState(false);
  const [isMovingLeft, setIsMovingLeft] = useState(false);
  const [isMovingRight, setIsMovingRight] = useState(false);
  
  const lastMousePos = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: 0, y: 0 });
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef<Set<string>>(new Set());
  const isInitialized = useRef(false);

  // Initialize rotation to match camera's current orientation
  useEffect(() => {
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(camera.quaternion);
    
    rotation.current.y = Math.atan2(forward.x, forward.z);
    rotation.current.x = Math.asin(-forward.y);
    isInitialized.current = true;
  }, [camera]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.code);
      
      switch (e.code) {
        case 'KeyW':
          setIsMovingForward(true);
          break;
        case 'KeyS':
          setIsMovingBackward(true);
          break;
        case 'KeyA':
          setIsMovingLeft(true);
          break;
        case 'KeyD':
          setIsMovingRight(true);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.code);
      
      switch (e.code) {
        case 'KeyW':
          setIsMovingForward(false);
          break;
        case 'KeyS':
          setIsMovingBackward(false);
          break;
        case 'KeyA':
          setIsMovingLeft(false);
          break;
        case 'KeyD':
          setIsMovingRight(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle mouse input
  useEffect(() => {
    const canvas = gl.domElement;
    console.log('Setting up mouse events on canvas:', canvas);
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left mouse button only
        console.log('Mouse down - starting drag');
        setIsDragging(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'none';
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        console.log('Mouse up - stopping drag');
        setIsDragging(false);
        canvas.style.cursor = 'default';
      }
    };
    
    const handleMouseLeave = () => {
      console.log('Mouse leave - stopping drag');
      setIsDragging(false);
      canvas.style.cursor = 'default';
    };

    const handleMouseMove = (e: MouseEvent) => {
      console.log('Mouse move event, isDragging:', isDragging, 'deltaX:', e.clientX - lastMousePos.current.x, 'deltaY:', e.clientY - lastMousePos.current.y);
      
      if (isDragging) {
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        
        // Update rotation based on mouse movement
        rotation.current.y -= deltaX * lookSpeed;
        rotation.current.x -= deltaY * lookSpeed;
        
        // Constrain vertical rotation to prevent over-rotation
        rotation.current.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, rotation.current.x));
        
        console.log('Mouse move - rotation updated to:', rotation.current);
        console.log('Camera rotation before update:', camera.rotation);
        
        // Update last mouse position
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.style.cursor = 'default';
    };
  }, [gl, lookSpeed, isDragging]);

  // Update camera position and rotation every frame
  useFrame((state, delta) => {
    if (!isInitialized.current) return;
    
    // Create a quaternion from the rotation to avoid gimbal lock and prevent roll
    const quaternion = new THREE.Quaternion();
    
    // Apply Y rotation (yaw) first
    quaternion.setFromAxisAngle(upVector, rotation.current.y);
    
    // Create a right vector perpendicular to the up vector
    const rightVector = new THREE.Vector3();
    rightVector.crossVectors(new THREE.Vector3(0, 0, -1), upVector).normalize();
    
    // Apply X rotation (pitch) around the right vector
    const pitchQuaternion = new THREE.Quaternion();
    pitchQuaternion.setFromAxisAngle(rightVector, rotation.current.x);
    
    // Combine the rotations
    quaternion.multiply(pitchQuaternion);
    
    // Apply the quaternion to the camera
    camera.quaternion.copy(quaternion);
    
    // Ensure the camera's up vector matches our desired up vector
    camera.up.copy(upVector);

    // Debug: log camera rotation every few frames
    if (Math.random() < 0.01) { // Log ~1% of frames
      console.log('Frame update - camera rotation:', camera.rotation);
      console.log('Current rotation state:', rotation.current);
      console.log('Camera up vector:', camera.up);
    }

    // Calculate movement direction based on camera orientation
    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    
    // Apply camera's current orientation to movement vectors
    forward.applyQuaternion(camera.quaternion);
    right.applyQuaternion(camera.quaternion);

    // Reset velocity
    velocity.current.set(0, 0, 0);

    // Apply movement based on keys pressed
    if (isMovingForward) {
      velocity.current.add(forward.clone().multiplyScalar(movementSpeed * delta));
    }
    if (isMovingBackward) {
      velocity.current.add(forward.clone().multiplyScalar(-movementSpeed * delta));
    }
    if (isMovingRight) {
      velocity.current.add(right.clone().multiplyScalar(movementSpeed * delta));
    }
    if (isMovingLeft) {
      velocity.current.add(right.clone().multiplyScalar(-movementSpeed * delta));
    }

    // Update camera position
    camera.position.add(velocity.current);
  });

  return null; // This component doesn't render anything
}
