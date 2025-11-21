import { createContext, ReactNode, useContext, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';

type SnackbarAction = { label: string; onPress: () => void } | null;

type SnackbarType = 'success' | 'error' | 'info';

type SnackbarContextType = {
  showSnackbar: ({
    message,
    label,
    onPress,
    type,
  }: {
    message: string;
    label: string;
    onPress: () => void;
    type?: SnackbarType;
  }) => void;
};

const SnackbarContext = createContext<SnackbarContextType>({
  showSnackbar: () => {},
});

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [action, setAction] = useState<SnackbarAction>(null);
  const [type, setType] = useState<SnackbarType | undefined>(undefined);

  const showSnackbar = ({
    message,
    label,
    onPress,
    type,
  }: {
    message: string;
    label: string;
    onPress: () => void;
    type?: SnackbarType;
  }) => {
    setMessage(message);
    setAction({ label, onPress });
    setType(type);
    setVisible(true);
  };

  const onDismissSnackBar = () => setVisible(false);

  const defaultAction = { label: 'OK', onPress: onDismissSnackBar };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      <View style={styles.providerContainer}>
        {children}
        <Snackbar
          visible={visible}
          onDismiss={onDismissSnackBar}
          style={[
            styles.snackbar,
            type === 'success' ? styles.success : type === 'error' ? styles.error : null,
          ]}
          action={action || defaultAction}>
          {message}
        </Snackbar>
      </View>
    </SnackbarContext.Provider>
  );
};

const styles = StyleSheet.create({
  providerContainer: {
    flex: 1,
  },
  snackbar: {
    // RNP Snackbar jest domyślnie na dole, gdy jest w kontenerze flex: 1.
    // Dodatkowe style zazwyczaj nie są potrzebne do pozycjonowania.
  },
  success: {
    backgroundColor: 'green',
  },
  error: {
    backgroundColor: 'red',
  },
});
