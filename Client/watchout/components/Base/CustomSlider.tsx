import { Slider } from '@miblanchard/react-native-slider';
import { View } from 'react-native';
import { Text } from 'components/Base/Text';
import { theme } from 'utils/theme';
import { Row } from './Row';

type CustomSliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  labels?: {
    minLabel: string;
    maxLabel: string;
  };
  min: number;
  max: number;
  step: number;
};

export const CustomSlider = ({
  value,
  onValueChange,
  labels,
  min,
  max,
  step = 1,
}: CustomSliderProps) => {
  return (
    <View>
      {labels && (
        <Row style={{ marginBottom: 8, justifyContent: 'space-between' }}>
          <Text variant="body2" color="secondary">
            {labels?.minLabel}
          </Text>
          <Text variant="body2" color="secondary">
            {labels?.maxLabel}
          </Text>
        </Row>
      )}
      <Slider
        value={value}
        onValueChange={([value]) => onValueChange(value)}
        step={step}
        trackStyle={{ height: 16, borderRadius: 7.5 }}
        thumbStyle={{ width: 32, height: 32, borderRadius: 16 }}
        thumbTintColor={theme.palette.text.secondary}
        minimumTrackTintColor={theme.palette.primary}
        maximumTrackTintColor={'#E0E0E0'}
        minimumValue={min}
        maximumValue={max}
      />
    </View>
  );
};
