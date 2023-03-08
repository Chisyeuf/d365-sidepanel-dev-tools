import * as React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import { useGridApiContext, useGridRootProps } from '@mui/x-data-grid';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

type GridToolbarFilterXMLButtonProps = {
    filterXMLsetter: (filterXML: string | null) => void
}

// const CustomInputComponent = ({ inputRef, ...rest } : InputBaseComponentProps) => (
// );

export const GridToolbarFilterXMLButton = React.forwardRef<HTMLButtonElement, ButtonProps & GridToolbarFilterXMLButtonProps>(
    function GridToolbarFilterXMLButton(props, ref) {
        const { onClick, filterXMLsetter, ...other } = props;
        const apiRef = useGridApiContext();
        const rootProps = useGridRootProps();

        const [filterApplied, setFilterApplied] = useState<boolean>(false)
        const [open, setOpen] = useState<boolean>(false)
        const [content, setContent] = useState<string>('')

        const openDialog = () => {
            setOpen(true)
        }

        const resetXml = () => {
            filterXMLsetter(null)
            setFilterApplied(false)
        }

        const onClose = () => {
            // setContent('')
            setOpen(false)
        }

        const applyXml = () => {
            if (content && content !== '') {
                filterXMLsetter(content)
                setFilterApplied(true)
            }
            setOpen(false)
        }

        return (
            <>
                <rootProps.slots.baseButton
                    ref={ref}
                    size="small"
                    startIcon={filterApplied ? <FilterAltOffIcon /> : <FilterAltIcon />}
                    {...other}
                    onClick={() => { filterApplied ? resetXml() : openDialog() }}
                    {...rootProps.slotProps?.baseButton}
                >
                    {filterApplied ? "Remove XML" : "Fetch XML"}
                </rootProps.slots.baseButton>
                <Dialog onClose={onClose} open={open} maxWidth={false} >
                    <DialogTitle>
                        Filter by Fetch XML
                    </DialogTitle>
                    <DialogContent sx={{ height: "70vh", width: "40vw" }}>
                        <TextField
                            multiline
                            value={content}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setContent(event.target.value) }}
                            // margin="normal"
                            // variant="outlined"
                            rows={32}
                            fullWidth
                            // InputProps={{
                            //     inputComponent: CustomInputComponent
                            // }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={applyXml} variant='contained'>
                            Apply
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    },
);