import { ErrorDisplay } from "@/base/common/ErrorDisplay";
import { useGetEventTypes } from "./event-types.hooks";
import { iconDictionary } from "@/utils/iconDictionary";
import { Box, Icon, Paper, Stack, Typography } from "@mui/material";

export const EventTypes = () => {
  const { data: eventTypes = [], isPending, isError } = useGetEventTypes();

  if (isPending) {
    return (
      <div className="flex justify-center my-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (isError) {
    return <ErrorDisplay />;
  }

  return (
    <Box marginY={3} paddingX={2}>
      <Typography variant="body1" marginBottom={2}>
        Poniżej znajdziesz listę rodzajów zdarzeń, które możesz zgłosić:
      </Typography>
      <Stack className="flex flex-col gap-4">
        {eventTypes.map((event, index) => (
          <Paper
            key={index}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
              wordBreak: "break-word",
              p: 2,
            }}
          >
            <Icon
              sx={{ fontSize: "4rem" }}
              className="text-gray-800"
              component={iconDictionary[event.icon]}
            />
            <Stack gap={1}>
              <Typography variant="h4" fontSize={'1.75rem'}>{event.name}</Typography>
              <Typography variant="body1">{event.description}</Typography>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};
