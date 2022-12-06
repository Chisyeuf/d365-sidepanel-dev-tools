
import { Button, createTheme, ThemeProvider } from '@mui/material';
import { Stack } from '@mui/system';
import React, { forwardRef, useEffect, useState } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../utils/global/.processClass';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import HandymanIcon from '@mui/icons-material/Handyman';

class DevToolsButton extends ProcessButton {
    constructor() {
        super(
            'devtools',
            'Dev Tools',
            <HandymanIcon />,
            56
        );
        this.process = DevToolsProcess;
    }

    reStyleSidePane(): void {
        var sidePane = document.querySelector<HTMLElement>('#' + this.id);
        if (sidePane) {
            sidePane.style.width = this.width + "px";
            var dev = sidePane.querySelector<HTMLElement>("div:first-child");
            if (dev) {
                dev.style.minWidth = "100%";
                var header = dev.querySelector<HTMLElement>("div:first-child");
                if (header) {
                    header.style.flexDirection = "column-reverse";
                    header.style.paddingLeft = "5px";
                    header.style.paddingRight = "5px";
                    header.style.alignItems = "flex-end";
                    header.style.justifyContent = "flex-end";

                    var h2 = header.querySelector<HTMLElement>("h2");
                    if (h2) {
                        h2.style.width = "100%";
                        h2.style.alignSelf = "unset";
                        h2.style.maxHeight = "none";
                        h2.style.writingMode = "vertical-rl";
                    }

                    var button = header.querySelector<HTMLElement>("button");
                    if (button) {
                        button.style.alignSelf = "unset";
                        button.style.marginRight = "8px";
                    }
                }
            }
        }
    }
}

const theme = createTheme({
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    maxWidth: "46px",
                    minWidth: "auto"
                },
                startIcon: {
                    marginLeft: 0,
                    marginRight: 0
                }
            },
        },
    },
});

const DevToolsProcess = forwardRef<ProcessRef, ProcessProps>(
    function DevToolsProcess(props: ProcessProps) {

        const [toolsList] = useState([GodMode]);
        // setToolsList();

        return (<ThemeProvider theme={theme}>
            <Stack spacing={2} width="100%" padding={"5px"}>
                {
                    toolsList?.map((SubProcess, index) => {
                        return <SubProcess />;
                    })
                }
            </Stack>
        </ThemeProvider>);
    });

type SubProcessProps = {

}
function GodMode(props: SubProcessProps) {
    const lockedIcon: string = "LockSolid";
    const unlockedIcon: string = "UnlockSolid";


    const [godEnable, setGodEnable] = useState(false);
    const [formControls, setFormControls] = useState<ReturnType<typeof FormControl | typeof FieldControl>[]>();

    const onClick = () => {
        setGodEnable((prev) => !prev);
    }

    const populateControls = () => {
        console.log("populate");
        var formControls: ReturnType<typeof FormControl | typeof FieldControl>[] = [];
        Xrm.Page.ui.controls?.forEach(function (c) {
            formControls.push(FieldControl(c));
        });
        Xrm.Page.ui.tabs?.forEach(function (t) {
            formControls.push(FormControl(t));
            t.sections?.forEach(function (s) {
                formControls.push(FormControl(s));
            });
        });
        setFormControls(formControls);
    };

    useEffect(() => {
        const toggleVisible = () => {
            formControls?.forEach(function (c) {
                c.toggleVisible(godEnable);
            });
        }

        const toggleDisabled = () => {
            formControls?.forEach(function (c) {
                c.toggleDisabled(godEnable);
            });
        }

        toggleVisible();
        toggleDisabled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [godEnable])



    useEffect(() => {
        populateControls();
    }, []);
    return (<Button variant="contained" onClick={onClick} startIcon={godEnable ? <LockOpenIcon /> : <LockIcon />} />);
}

function FormControl(control: Xrm.Controls.Tab | Xrm.Controls.Section) {

    const originalVisible = control.getVisible();

    var toggleVisible = (godEnable: boolean) => {
        control.setVisible(godEnable || originalVisible);
    };
    var toggleDisabled = () => {
        return;
    };

    return { toggleVisible, toggleDisabled };
}

function FieldControl(c: Xrm.Controls.Control) {

    var control = c as Xrm.Controls.StandardControl & Xrm.Controls.UiCanSetVisibleElement;
    const originalVisible = control.getVisible();
    const originalDisabled = control.getDisabled();

    var toggleVisible = (godEnable: boolean) => {
        control.setVisible(godEnable || originalVisible);
    };
    var toggleDisabled = (godEnable: boolean) => {
        control.setDisabled(godEnable || originalDisabled);
    };

    return { toggleVisible, toggleDisabled };
}


var devTools = new DevToolsButton();
export default devTools;