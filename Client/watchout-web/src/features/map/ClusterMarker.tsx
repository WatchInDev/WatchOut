import { AdvancedMarker, Marker } from "@vis.gl/react-google-maps";
import type { EventCluster } from "../../utils/types";
import CircleIcon from '@mui/icons-material/Circle';
import { Box } from "@mui/material";


type ClusterMarkerProps = {
  cluster: EventCluster;
};

export const ClusterMarker = ({ cluster }: ClusterMarkerProps) => {
  const { latitude, longitude, count } = cluster;

  return (
    <AdvancedMarker
      position={{ lat: latitude, lng: longitude }}
      title={`Cluster of ${count} events`}
    >
      <Box display="flex" alignItems="center" gap={0.5} bgcolor="white" padding={0.5} borderRadius="50%">
        <CircleIcon />
        <span>{count}</span>
      </Box>
    </AdvancedMarker>
  );
};
