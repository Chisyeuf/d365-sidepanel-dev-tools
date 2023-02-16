import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className';

ClassNameGenerator.configure(
    // Do something with the componentName
    (componentName) => `sidepanel-dev-tools-${componentName.replace('Mui', '')}`,
);