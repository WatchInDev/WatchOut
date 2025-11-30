import { CustomModal } from 'components/Base/CustomModal';
import { Row } from 'components/Base/Row';
import { Text } from 'components/Base/Text';
import { ReactNode } from 'react';
import { Button } from 'react-native-paper';
import { theme } from 'utils/theme';

type ConfirmationModalProps = {
  isVisible: boolean;
  content: string | ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export const ConfirmationModal = ({ isVisible, content, onConfirm, onCancel, isLoading }: ConfirmationModalProps) => {
  return (
    <CustomModal visible={isVisible} onRequestClose={onCancel}>
      <Text variant="h3" style={{ marginBottom: 8 }}>Potwierdzenie</Text>
      <Text variant="body1" style={{ marginBottom: 16 }}>
        {content}
      </Text>
      <Row style={{ justifyContent: 'flex-end', marginTop: 24, gap: 12 }}>
        <Button mode='outlined' onPress={onCancel} disabled={isLoading}>
          Anuluj
        </Button>
        <Button mode="contained" onPress={onConfirm} buttonColor={theme.palette.error} disabled={isLoading} loading={isLoading}>
          Usuń
        </Button>
      </Row>
    </CustomModal>
  );
};
