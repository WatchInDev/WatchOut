import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  headerOffset = 48,
  headerBottomSpacing = 48,
  footerOffset = 20,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.header,
            {
              marginTop: headerOffset,
              marginBottom: headerBottomSpacing,
            },
          ]}
        >
          {header}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        <View style={[styles.footer, { marginBottom: footerOffset }]}>
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
    minHeight: 200,
  },

  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    gap: 16,
  },

  footer: {
    minHeight: 120,
    justifyContent: 'flex-start',
  },
});
