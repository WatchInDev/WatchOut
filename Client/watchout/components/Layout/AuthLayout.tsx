import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  header?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  headerOffset?: number;
  headerBottomSpacing?: number;
  footerOffset?: number;
};

export const AuthLayout: React.FC<Props> = ({
  header,
  children,
  footer,
  headerOffset = 32,
  headerBottomSpacing = 24,
  footerOffset = 12,
}) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const isSmallScreen = height < 700;

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.header,
            {
              marginTop: isSmallScreen ? 16 : headerOffset,
              marginBottom: isSmallScreen ? 16 : headerBottomSpacing,
            },
          ]}
        >
          {header}
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { justifyContent: 'center' },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          >
          {children}
        </ScrollView>


        <View
          style={[
            styles.footer,
            {
              marginBottom: isSmallScreen ? 8 : footerOffset,
            },
          ]}
        >
          {footer}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  header: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 8,
  },

  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    gap: 16,
  },

  footer: {
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
});
