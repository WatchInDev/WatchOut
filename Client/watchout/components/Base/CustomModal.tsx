import { ComponentProps, ReactNode } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { theme } from 'utils/theme';

type CustomModalProps = {
  children?: ReactNode;
} & Required<Pick<ComponentProps<typeof Modal>, 'visible' | 'onRequestClose'>>;

export const CustomModal = ({ children, ...modalProps }: CustomModalProps) => {
  return (
    <Modal {...modalProps} backdropColor='rgba(0,0,0,0.1)' animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>{children}</View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 0,
    maxHeight: '85%',
    backgroundColor: theme.palette.background.default,
    padding: 16,
    borderRadius: 8,
  },
});
