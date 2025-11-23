import { createContext, ReactNode, useContext, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { theme } from './theme';

type SnackbarAction = { label: string; onPress: () => void } | null;

type SnackbarType = 'success' | 'error' | 'info';

type SnackbarContextType = {
  showSnackbar: ({
    message,
    action,
    type,
  }: {
    message: string;
    action?: SnackbarAction;
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
  const [action, setAction] = useState<SnackbarAction | undefined>(undefined);
  const [type, setType] = useState<SnackbarType | undefined>(undefined);

  const showSnackbar = ({
    message,
    action,
    type,
  }: {
    message: string;
    action?: SnackbarAction;
    type?: SnackbarType;
  }) => {
    setMessage(message);
    setAction(action);
    setType(type);
    setVisible(true);
  };

  const onDismissSnackBar = () => setVisible(false);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      <View style={styles.providerContainer}>
        {children}
        <Snackbar
          wrapperStyle={{ top: 96 }}
          theme={{ colors: { text: 'white', primary: 'white', inverseOnSurface: 'white' } }}
          visible={visible}
          duration={2000}
          onDismiss={onDismissSnackBar}
          style={[type === 'success' ? styles.success : type === 'error' ? styles.error : null]}
          action={{ label: action?.label || '', onPress: action?.onPress || (() => {}) }}>
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
  success: {
    backgroundColor: theme.palette.success,
  },
  error: {
    backgroundColor: 'red',
  },
});
