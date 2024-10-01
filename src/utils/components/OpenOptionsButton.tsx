import type { ButtonPropsVariantOverrides, ButtonTypeMap, TextFieldProps } from '@mui/material';
import type { OverridableStringUnion } from '@mui/types';
import { Button, TextField } from '@mui/material';
import AutoNumeric, { Options } from 'autonumeric';
import React, { useEffect, useRef, useState } from 'react';
import { MessageType } from '../types/Message';
import { GetExtensionId } from '../global/common';

export type OpenOptionsButtonProps = {
    text?: string | null;
    variant?: OverridableStringUnion<"text" | "outlined" | "contained", ButtonPropsVariantOverrides>
};

function OpenOptionsButton(props: OpenOptionsButtonProps) {
    const { text, variant } = props;

    const extensionId = GetExtensionId();

    return (
        <Button variant={variant} onClick={() => {
            chrome.runtime.sendMessage(extensionId, { type: MessageType.OPENOPTIONS });
        }}>
            {text ?? 'Open option screen'}
        </Button>
    );
}

export default OpenOptionsButton;
