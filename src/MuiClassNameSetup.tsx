import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className';
import { projectPrefix } from './utils/global/var';

ClassNameGenerator.configure(
    // Do something with the componentName
    (componentName) => `${projectPrefix}${componentName.replace('Mui', '')}`,
);