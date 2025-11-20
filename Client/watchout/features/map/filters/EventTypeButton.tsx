import { IconWithTitle } from "components/Common/IconWithTitle";
import { TouchableOpacity } from "react-native";

type EventTypeButtonProps = {
  isActive: boolean;
  setFilters: React.Dispatch<React.SetStateAction<{
    hoursSinceReport: number;
    eventTypesIds: number[];
  }>>;
  type: {
    id: number;
    icon: string;
    name: string;
  };
};

export const EventTypeButton = ({ isActive, setFilters, type }: EventTypeButtonProps) => (
  <TouchableOpacity
    onPress={() => {
      if (isActive) {
        setFilters((prev) => ({
          ...prev,
          eventTypesIds: prev.eventTypesIds.filter((id) => id !== type.id),
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          eventTypesIds: [...prev.eventTypesIds, type.id],
        }));
      }
    }}
    key={type.id}>
    <IconWithTitle
      iconName={type.icon}
      label={type.name}
      isActive={isActive}
      iconSize={42}
      fontSize={12}
      iconStyle={{ paddingHorizontal: 12, paddingTop: 4 }}
      style={{ paddingVertical: 20 }}
    />
  </TouchableOpacity>
);
