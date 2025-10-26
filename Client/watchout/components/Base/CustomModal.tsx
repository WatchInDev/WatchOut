import { ComponentProps, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { theme } from 'utils/theme';

type CustomModalProps = {
  children?: ReactNode;
} & Required<Pick<ComponentProps<typeof Modal>, 'isVisible' | 'onBackdropPress'>>;

export const CustomModal = ({ children, ...modalProps }: CustomModalProps) => {
  return (
    <Modal {...modalProps}>
      <View style={styles.modalContent}>{children}</View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: theme.palette.background.default,
    padding: 16,
    borderRadius: 8,
  },
});
