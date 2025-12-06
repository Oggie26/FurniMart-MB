import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ARViewer from './ARViewer';

interface ARButtonProps {
    modelUrl: string;
    buttonText?: string;
    size?: 'small' | 'medium' | 'large';
    variant?: 'gradient' | 'outline' | 'solid';
}

const ARButton: React.FC<ARButtonProps> = ({
    modelUrl,
    buttonText = 'XEM TRONG PHÒNG',
    size = 'medium',
    variant = 'gradient',
}) => {
    const [showAR, setShowAR] = useState(false);

    const handlePress = () => {
        setShowAR(true);
    };

    const handleClose = () => {
        setShowAR(false);
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    fontSize: 13,
                    iconSize: 18,
                };
            case 'large':
                return {
                    paddingVertical: 18,
                    paddingHorizontal: 28,
                    fontSize: 17,
                    iconSize: 26,
                };
            default: // medium
                return {
                    paddingVertical: 14,
                    paddingHorizontal: 22,
                    fontSize: 15,
                    iconSize: 22,
                };
        }
    };

    const sizeStyles = getSizeStyles();

    const renderButton = () => {
        const buttonContent = (
            <View style={styles.buttonContent}>
                <Ionicons name="cube-outline" size={sizeStyles.iconSize} color="#fff" />
                <Text style={[styles.buttonText, { fontSize: sizeStyles.fontSize }]}>
                    {buttonText}
                </Text>
            </View>
        );

        if (variant === 'gradient') {
            return (
                <TouchableOpacity
                    style={styles.button}
                    onPress={handlePress}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                            styles.gradientButton,
                            {
                                paddingVertical: sizeStyles.paddingVertical,
                                paddingHorizontal: sizeStyles.paddingHorizontal,
                            },
                        ]}
                    >
                        {buttonContent}
                    </LinearGradient>
                </TouchableOpacity>
            );
        }

        if (variant === 'outline') {
            return (
                <TouchableOpacity
                    style={[
                        styles.outlineButton,
                        {
                            paddingVertical: sizeStyles.paddingVertical,
                            paddingHorizontal: sizeStyles.paddingHorizontal,
                        },
                    ]}
                    onPress={handlePress}
                    activeOpacity={0.7}
                >
                    <Ionicons name="cube-outline" size={sizeStyles.iconSize} color="#667eea" />
                    <Text
                        style={[
                            styles.buttonText,
                            { fontSize: sizeStyles.fontSize, color: '#667eea' },
                        ]}
                    >
                        {buttonText}
                    </Text>
                </TouchableOpacity>
            );
        }

        // solid variant
        return (
            <TouchableOpacity
                style={[
                    styles.solidButton,
                    {
                        paddingVertical: sizeStyles.paddingVertical,
                        paddingHorizontal: sizeStyles.paddingHorizontal,
                    },
                ]}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                {buttonContent}
            </TouchableOpacity>
        );
    };

    return (
        <>
            {renderButton()}

            <Modal
                visible={showAR}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={handleClose}
            >
                <ARViewer modelUrl={modelUrl} onClose={handleClose} />
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    outlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#667eea',
        backgroundColor: 'transparent',
    },
    solidButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderRadius: 12,
        backgroundColor: '#667eea',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default ARButton;
