import { CustomChip } from "components/Base/CustomChip";
import dayjs from "dayjs";
import { View } from "react-native";
import { HIGH_REPUTATION_THRESHOLD, LOW_REPUTATION_THRESHOLD } from "utils/constants";
import { Text } from "components/Base/Text";
import { Event } from "utils/types";

const reportIcons = (event: Event) => [
  {
    icon: 'account-alert',
    color: '#f44336',
    text: 'Niska reputacja autora',
    predicate: event.author.reputation < LOW_REPUTATION_THRESHOLD,
  },
  {
    icon: 'account-check',
    color: '#4caf50',
    text: 'Zaufany autor',
    predicate: event.author.reputation >= HIGH_REPUTATION_THRESHOLD,
  },
  {
    icon: 'thumb-down',
    color: '#f44336',
    text: 'Nieautentyczne',
    predicate: event.rating < LOW_REPUTATION_THRESHOLD,
  },
  {
    icon: 'check-decagram',
    color: '#4caf50',
    text: 'Potwierdzane',
    predicate: event.rating >= HIGH_REPUTATION_THRESHOLD,
  },
];

export const ReportStatusIcons = ({ event }: { event: Event }) => {
  const icons = reportIcons(event).filter(({ predicate }) => predicate);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
      {icons.map(({ icon, color, text }) => (
        <CustomChip
          key={text}
          icon={icon}
          iconColor={color}
          style={{ backgroundColor: color + '20', borderColor: color, borderWidth: 1 }}>
          <Text style={{ color }}>{text}</Text>
        </CustomChip>
      ))}

      {dayjs.utc().diff(dayjs.utc(event.reportedDate), 'minute') < 30 && (
        <CustomChip
          icon="calendar-clock"
          iconColor="#808080"
          style={{ backgroundColor: '#80808020', borderColor: '#808080', borderWidth: 1 }}>
          <Text style={{ color: '#808080' }}>Nowe zgłoszenie</Text>
        </CustomChip>
      )}
    </View>
  );
};