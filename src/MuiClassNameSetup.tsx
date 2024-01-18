import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className';
import { classesPrefix } from './utils/global/var';

ClassNameGenerator.configure(
    // Do something with the componentName
    (componentName) => `${classesPrefix}${componentName.replace('Mui', '')}`,
);