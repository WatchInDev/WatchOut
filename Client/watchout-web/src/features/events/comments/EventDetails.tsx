import React from "react";
import type { Event } from "@/utils/types";
import dayjs from "dayjs";
import { Box, Icon, Stack, Typography } from "@mui/material";
import { iconDictionary } from "@/utils/iconDictionary";

type EventDetailsProps = {
  event: Event;
};

export const EventDetails: React.FC<EventDetailsProps> = ({ event }) => {
  const reportedDateText = `${new Date(
    event.reportedDate
  ).toLocaleString()} (${dayjs(event.reportedDate).fromNow()})`;

  return (
    <Stack spacing={1}>
      <Box display='flex' alignItems='center' gap={2} marginBottom={2}>
        <Icon
          component={iconDictionary[event.eventType.icon]}
          sx={{ fontSize: 60 }}
        />
        <Typography variant="h2" fontSize={'1.5rem'}>{event.name}</Typography>
      </Box>
      <Typography variant="body2">Zgłoszono: {reportedDateText}</Typography>
      <Typography variant="body1" className="text-wrap break-words">{event.description}</Typography>
    </Stack>
  );
};
