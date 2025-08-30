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
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  
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

  // Function to request pointer lock
  const requestPointerLock = () => {
    const canvas = gl.domElement;
    if (canvas.requestPointerLock) {
      canvas.requestPointerLock();
    } else if ((canvas as any).mozRequestPointerLock) {
      (canvas as any).mozRequestPointerLock();
    } else if ((canvas as any).webkitRequestPointerLock) {
      (canvas as any).webkitRequestPointerLock();
    }
  };

  // Function to exit pointer lock
  const exitPointerLock = () => {
    if (document.exitPointerLock) {
      document.exitPointerLock();
    } else if ((document as any).mozExitPointerLock) {
      (document as any).mozExitPointerLock();
    } else if ((document as any).webkitExitPointerLock) {
      (document as any).webkitExitPointerLock();
    }
  };

  // Handle pointer lock state changes
  useEffect(() => {
    const handlePointerLockChange = () => {
      const isLocked = !!(document.pointerLockElement || 
                          (document as any).mozPointerLockElement || 
                          (document as any).webkitPointerLockElement);
      setIsPointerLocked(isLocked);
      
      if (!isLocked && isDragging) {
        setIsDragging(false);
      }
    };

    const handlePointerLockError = (e: Event) => {
      console.error('Pointer lock failed:', e);
      setIsPointerLocked(false);
      setIsDragging(false);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mozpointerlockchange', handlePointerLockChange);
    document.addEventListener('webkitpointerlockchange', handlePointerLockChange);
    
    document.addEventListener('pointerlockerror', handlePointerLockError);
    document.addEventListener('mozpointerlockerror', handlePointerLockError);
    document.addEventListener('webkitpointerlockerror', handlePointerLockError);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mozpointerlockchange', handlePointerLockChange);
      document.removeEventListener('webkitpointerlockchange', handlePointerLockChange);
      
      document.removeEventListener('pointerlockerror', handlePointerLockError);
      document.removeEventListener('mozpointerlockerror', handlePointerLockError);
      document.removeEventListener('webkitpointerlockerror', handlePointerLockError);
    };
  }, [isDragging]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.code);
      
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setIsMovingForward(true);
          break;
        case 'KeyS':
        case 'ArrowDown':
          setIsMovingBackward(true);
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setIsMovingLeft(true);
          break;
        case 'KeyD':
        case 'ArrowRight':
          setIsMovingRight(true);
          break;
        case 'Escape':
          // Exit pointer lock when Escape is pressed
          if (isPointerLocked) {
            exitPointerLock();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.code);
      
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setIsMovingForward(false);
          break;
        case 'KeyS':
        case 'ArrowDown':
          setIsMovingBackward(false);
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setIsMovingLeft(false);
          break;
        case 'KeyD':
        case 'ArrowRight':
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
  }, [isPointerLocked]);

  // Handle mouse input
  useEffect(() => {
    const canvas = gl.domElement;
    console.log('Setting up mouse events on canvas:', canvas);
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && !isPointerLocked) { // Left mouse button only, and not already locked
        console.log('Mouse down - requesting pointer lock');
        setIsDragging(true);
        requestPointerLock();
        e.preventDefault();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0 && isPointerLocked) {
        console.log('Mouse up - exiting pointer lock');
        setIsDragging(false);
        exitPointerLock();
      }
    };

    const handleMouseLeave = () => {
      if (isPointerLocked) {
        console.log('Mouse leave - exiting pointer lock');
        setIsDragging(false);
        exitPointerLock();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPointerLocked && isDragging) {
        // Use movementX and movementY for pointer lock mode
        const deltaX = e.movementX || 0;
        const deltaY = e.movementY || 0;
        
        // Update rotation based on mouse movement
        rotation.current.y -= deltaX * lookSpeed;
        rotation.current.x -= deltaY * lookSpeed;
        
        // Constrain vertical rotation to prevent over-rotation
        rotation.current.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, rotation.current.x));
        
        console.log('Mouse move - rotation updated to:', rotation.current);
        console.log('Camera rotation before update:', camera.rotation);
      }
    };

    // Add context menu prevention
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      
      // Exit pointer lock when component unmounts
      if (isPointerLocked) {
        exitPointerLock();
      }
    };
  }, [gl, lookSpeed, isDragging, isPointerLocked]);

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
