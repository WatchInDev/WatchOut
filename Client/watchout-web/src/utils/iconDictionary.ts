import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import DirectionsCarOffIcon from '@mui/icons-material/CarCrash';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import GroupsIcon from '@mui/icons-material/Groups';
import ScienceIcon from '@mui/icons-material/Science';
import BiotechIcon from '@mui/icons-material/Biotech';
import PublicIcon from '@mui/icons-material/Public';
import BombIcon from '@mui/icons-material/Dangerous';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';

export const iconDictionary: Record<string, React.ElementType> = {
  'car-off': DirectionsCarOffIcon,
  'fire': LocalFireDepartmentIcon,
  'lightning-bolt': FlashOnIcon,
  'weather-lightning-rainy': ThunderstormIcon,
  'account-multiple': GroupsIcon,
  'chemical-weapon': ScienceIcon,
  'virus': BiotechIcon,
  'biohazard': PublicIcon,
  'bomb': BombIcon,
  'alert-circle': CrisisAlertIcon,
};
