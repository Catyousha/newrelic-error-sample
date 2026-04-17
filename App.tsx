import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import NewRelic from 'newrelic-react-native-agent';
import Config from 'react-native-config';
import { simulateRequestError } from './src/helpers/api';

const NEW_RELIC_APP_TOKEN = Config.NEW_RELIC_APP_TOKEN || '';

const initializeNewRelic = () => {
  console.log('[NewRelic] Initializing with config', {
    NEW_RELIC_APP_TOKEN: NEW_RELIC_APP_TOKEN ? NEW_RELIC_APP_TOKEN : '(missing)',
  });
  if (!NEW_RELIC_APP_TOKEN || NEW_RELIC_APP_TOKEN.includes('PUT_YOUR')) {
    return;
  }

  const agentConfiguration = {
    analyticsEventEnabled: true,
    crashReportingEnabled: true,
    interactionTracingEnabled: true,
    networkRequestEnabled: true,
    networkErrorRequestEnabled: true,
    httpResponseBodyCaptureEnabled: true,
    loggingEnabled: true,
    logLevel: NewRelic.LogLevel.INFO,
    webViewInstrumentation: true,
  };

  NewRelic.startAgent(NEW_RELIC_APP_TOKEN, agentConfiguration);
  NewRelic.setJSAppVersion('1.0.0');
  (globalThis as any).newrelic = NewRelic;
};

function App() {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(
    'Tap a button to trigger API call.',
  );

  useEffect(() => {
    initializeNewRelic();
  }, []);

  const triggerSimulatedError = async (
    status: number,
    url: string,
    method: string,
    label: string,
  ) => {
    setLoading(true);
    try {
      await simulateRequestError(status, url, method);
      setLastResult(`${label}: request unexpectedly succeeded.`);
    } catch (error) {
      const status = (error as any)?.response?.status;
      setLastResult(`${label}: failed with status ${status || 'unknown'}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>New Relic recordError Demo</Text>
        <Text style={styles.description}>
          This app reports only 5xx responses using the same helper logic.
        </Text>

        <Pressable
          disabled={loading}
          onPress={() =>
            triggerSimulatedError(503, '/simulated-503', 'GET', '503 simulation')
          }
          style={styles.button}
        >
          <Text style={styles.buttonText}>Trigger 503 (Should be recorded)</Text>
        </Pressable>

        <Pressable
          disabled={loading}
          onPress={() =>
            triggerSimulatedError(404, '/simulated-404', 'GET', '404 simulation')
          }
          style={[styles.button, styles.secondaryButton]}
        >
          <Text style={styles.buttonText}>Trigger 404 (Should be ignored)</Text>
        </Pressable>

        {loading ? <ActivityIndicator size="small" color="#0f172a" /> : null}

        <Text style={styles.result}>{lastResult}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  description: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#1e293b',
  },
  buttonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  result: {
    marginTop: 24,
    fontSize: 14,
    color: '#0f172a',
  },
});

export default App;
