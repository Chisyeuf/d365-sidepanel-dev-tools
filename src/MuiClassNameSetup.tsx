import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className';
import { PROJECT_PREFIX } from './utils/global/var';

ClassNameGenerator.configure(
    // Do something with the componentName
    (componentName) => `${PROJECT_PREFIX}${componentName.replace('Mui', '')}`,
);