"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.FilterInput = void 0;
var react_1 = require("react");
var _processClass_1 = require("../utils/global/.processClass");
var requestsType_1 = require("../utils/global/requestsType");
var RetrieveEntities_1 = require("../utils/hooks/RetrieveEntities");
var RetrievePrimaryAttribute_1 = require("../utils/hooks/RetrievePrimaryAttribute");
var common_1 = require("../utils/global/common");
var react_2 = require("react");
var RetrieveAttributesMetaData_1 = require("../utils/hooks/RetrieveAttributesMetaData");
var RetrieveAttributes_1 = require("../utils/hooks/RetrieveAttributes");
var RetrievePicklistValues_1 = require("../utils/hooks/RetrievePicklistValues");
var Sync_1 = require("@mui/icons-material/Sync");
var system_1 = require("@mui/system");
var usehooks_ts_1 = require("usehooks-ts");
var material_1 = require("@mui/material");
var Delete_1 = require("@mui/icons-material/Delete");
var x_date_pickers_1 = require("@mui/x-date-pickers");
var dayjs_1 = require("dayjs");
var FilterAlt_1 = require("@mui/icons-material/FilterAlt");
var AdapterDayjs_1 = require("@mui/x-date-pickers/AdapterDayjs");
var Search_1 = require("@mui/icons-material/Search");
var x_data_grid_1 = require("@mui/x-data-grid");
var core_1 = require("@material-ui/core");
var RetrieveRecordsDisplayNames_1 = require("../utils/hooks/RetrieveRecordsDisplayNames");
var RetrieveAllRecords_1 = require("../utils/hooks/RetrieveAllRecords");
var Clear_1 = require("@mui/icons-material/Clear");
var UpdateRecordButton = /** @class */ (function (_super) {
    __extends(UpdateRecordButton, _super);
    function UpdateRecordButton() {
        var _this = _super.call(this, 'updaterecord', 'Update Record', react_2["default"].createElement(Sync_1["default"], null), 500) || this;
        _this.process = UpdateRecordProcess;
        return _this;
    }
    return UpdateRecordButton;
}(_processClass_1.ProcessButton));
function UpdateRecordProcess(props) {
    var _a = react_1.useState(Xrm.Page.data.entity.getEntityName()), entityname = _a[0], _setEntityname = _a[1];
    var _b = react_1.useState(common_1.formatId(Xrm.Page.data.entity.getId().toLowerCase())), recordid = _b[0], setRecordid = _b[1];
    var _c = react_1.useState(""), filterAttribute = _c[0], setFilterAttribute = _c[1];
    var setEntityname = function (entityname) {
        _setEntityname(entityname);
        setRecordid("");
    };
    var setCurrentRecord = function () {
        setEntityname(Xrm.Page.data.entity.getEntityName());
        setRecordid(common_1.formatId(Xrm.Page.data.entity.getId().toLowerCase()));
    };
    // useEffect(() => {
    //     setCurrentRecord();
    // }, [])
    var launchUpdate = function () {
        console.log("Launch Update for " + entityname + " " + recordid);
    };
    return (react_2["default"].createElement(x_date_pickers_1.LocalizationProvider, { dateAdapter: AdapterDayjs_1.AdapterDayjs },
        react_2["default"].createElement(system_1.Stack, { spacing: "4px", width: "100%", padding: "10px" },
            react_2["default"].createElement(NavTopBar, { setEntityname: setEntityname, setRecordid: setRecordid, setCurrentRecord: setCurrentRecord, launchUpdate: launchUpdate, setFilterAttribute: setFilterAttribute, entityname: entityname, recordid: recordid }),
            react_2["default"].createElement(material_1.Divider, null),
            react_2["default"].createElement(AttributesList, { entityname: entityname, recordid: recordid, filter: filterAttribute }),
            entityname + " / " + recordid)));
}
function AttributesList(props) {
    var _a;
    var entityname = props.entityname;
    var recordid = props.recordid;
    var attributesMetadataRetrieved = RetrieveAttributesMetaData_1.RetrieveAttributesMetaData(entityname);
    var attributesRetrieved = RetrieveAttributes_1.RetrieveAttributes(entityname, recordid, (_a = attributesMetadataRetrieved === null || attributesMetadataRetrieved === void 0 ? void 0 : attributesMetadataRetrieved.map(function (value) {
        if (value.MStype !== requestsType_1.MSType.Lookup)
            return value.LogicalName;
        else
            return "_" + value.LogicalName + "_value";
    })) !== null && _a !== void 0 ? _a : []);
    return (react_2["default"].createElement(system_1.Stack, { spacing: "1px", overflow: "scroll" }, attributesMetadataRetrieved === null || attributesMetadataRetrieved === void 0 ? void 0 : attributesMetadataRetrieved.map(function (metadata) {
        var attributeName = metadata.MStype !== requestsType_1.MSType.Lookup ? metadata.LogicalName : "_" + metadata.LogicalName + "_value";
        // console.log(metadata.LogicalName, metadata.MStype, attributeName)
        return (metadata.DisplayName.indexOf(props.filter) !== -1 ||
            metadata.LogicalName.indexOf(props.filter) !== -1 ||
            metadata.SchemaName.indexOf(props.filter) !== -1)
            && react_2["default"].createElement(AttributeNode, { disabled: !metadata.IsValidForUpdate, attribute: metadata, entityname: props.entityname, value: attributesRetrieved[attributeName] });
    })));
}
function AttributeNode(props) {
    var _a = usehooks_ts_1.useBoolean(false), isDirty = _a.value, setTrue = _a.setTrue, setFalse = _a.setFalse;
    var manageDirty = { setTrue: setTrue, setFalse: setFalse };
    var _b = usehooks_ts_1.useBoolean(false), isToUpdate = _b.value, setToUpdate = _b.setTrue, removeToUpdate = _b.setFalse;
    var _c = usehooks_ts_1.useBoolean(false), toReset = _c.value, setToReset = _c.setTrue, resetToReset = _c.setFalse;
    react_1.useEffect(function () {
        if (isToUpdate === false) {
            setToReset();
        }
    }, [isToUpdate, setToReset]);
    react_1.useEffect(function () {
        if (toReset === true) {
            resetToReset();
        }
    }, [resetToReset, toReset]);
    return (react_2["default"].createElement(system_1.Stack, { direction: "row", width: "100%", alignItems: "center", spacing: "2px" },
        react_2["default"].createElement(material_1.Typography, { onDoubleClick: function () { navigator.clipboard.writeText(props.attribute.LogicalName); setToUpdate(); }, key: props.attribute.LogicalName + "_label", title: props.attribute.DisplayName + "(" + props.attribute.LogicalName + ")", width: "80%", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", color: props.disabled ? "lightgray" : "#666" }, props.attribute.DisplayName),
        react_2["default"].createElement(material_1.FormControl, { size: 'small', fullWidth: true },
            react_2["default"].createElement(AttributeFactory, { key: props.attribute.LogicalName, attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: setToUpdate, manageDirty: { set: manageDirty.setTrue, remove: manageDirty.setFalse }, reset: toReset, disabled: props.disabled })),
        react_2["default"].createElement(material_1.IconButton, { "aria-label": "delete", onClick: removeToUpdate },
            react_2["default"].createElement(Delete_1["default"], { fontSize: 'large' }))));
}
function AttributeFactory(props) {
    switch (props.attribute.MStype) {
        case requestsType_1.MSType.Lookup:
            return (react_2["default"].createElement(LookupNode, { attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: props.setToUpdate, manageDirty: props.manageDirty, reset: props.reset, disabled: props.disabled }));
        case requestsType_1.MSType.String:
            return (react_2["default"].createElement(StringNode, { attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: props.setToUpdate, manageDirty: props.manageDirty, reset: props.reset, disabled: props.disabled }));
        case requestsType_1.MSType.Memo:
            return (react_2["default"].createElement(MemoNode, { attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: props.setToUpdate, manageDirty: props.manageDirty, reset: props.reset, disabled: props.disabled }));
        case requestsType_1.MSType.Decimal:
            return (react_2["default"].createElement(DecimalNode, { attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: props.setToUpdate, manageDirty: props.manageDirty, reset: props.reset, disabled: props.disabled }));
        case requestsType_1.MSType.Double:
            return (react_2["default"].createElement(DoubleNode, { attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: props.setToUpdate, manageDirty: props.manageDirty, reset: props.reset, disabled: props.disabled }));
        case requestsType_1.MSType.Money:
            return (react_2["default"].createElement(MoneyNode, { attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: props.setToUpdate, manageDirty: props.manageDirty, reset: props.reset, disabled: props.disabled }));
        case requestsType_1.MSType.Integer:
            return (react_2["default"].createElement(IntegerNode, { attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: props.setToUpdate, manageDirty: props.manageDirty, reset: props.reset, disabled: props.disabled }));
        case requestsType_1.MSType.BigInt:
            return (react_2["default"].createElement(BigIntNode, { attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: props.setToUpdate, manageDirty: props.manageDirty, reset: props.reset, disabled: props.disabled }));
        case requestsType_1.MSType.Boolean:
            return (react_2["default"].createElement(BooleanNode, { attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: props.setToUpdate, manageDirty: props.manageDirty, reset: props.reset, disabled: props.disabled }));
        case requestsType_1.MSType.DateTime:
            return (react_2["default"].createElement(DateTimeNode, { attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: props.setToUpdate, manageDirty: props.manageDirty, reset: props.reset, disabled: props.disabled }));
        case requestsType_1.MSType.Status:
            return (react_2["default"].createElement(PicklistNode, { attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: props.setToUpdate, manageDirty: props.manageDirty, reset: props.reset, disabled: props.disabled }));
        case requestsType_1.MSType.State:
            return (react_2["default"].createElement(PicklistNode, { attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: props.setToUpdate, manageDirty: props.manageDirty, reset: props.reset, disabled: props.disabled }));
        case requestsType_1.MSType.Picklist:
            return (react_2["default"].createElement(PicklistNode, { nullable: true, attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: props.setToUpdate, manageDirty: props.manageDirty, reset: props.reset, disabled: props.disabled }));
        case requestsType_1.MSType.MultiSelectPicklist:
            return (react_2["default"].createElement(PicklistNode, { multiple: true, attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: props.setToUpdate, manageDirty: props.manageDirty, reset: props.reset, disabled: props.disabled }));
        case requestsType_1.MSType.Image:
            return (react_2["default"].createElement(ImageNode, { attribute: props.attribute, entityname: props.entityname, value: props.value, setToUpdate: props.setToUpdate, manageDirty: props.manageDirty, reset: props.reset, disabled: props.disabled }));
        default:
            return (react_2["default"].createElement(react_2["default"].Fragment, null));
    }
}
function LookupNode(props) {
    var _a = react_1.useState(props.value), oldValue = _a[0], setOldValue = _a[1];
    var _b = react_1.useState(props.value), value = _b[0], setValue = _b[1];
    var setDirty = function (newValue) {
        if (oldValue !== newValue) {
            props.manageDirty.set();
        }
        else {
            props.manageDirty.remove();
        }
    };
    react_1.useEffect(function () {
        setOldValue(props.value);
        setValue(props.value);
    }, [props.value]);
    react_1.useEffect(function () {
        if (props.reset) {
            setValue(oldValue);
            props.manageDirty.remove();
        }
    }, [oldValue, props.manageDirty, props.reset]);
    var onChange = function (newValue) {
        props.setToUpdate();
        setValue(newValue);
        setDirty(newValue);
    };
    return react_2["default"].createElement(RecordSelector, { entityname: props.attribute.Parameters.Target, recordid: value, setRecordid: onChange, disabled: props.disabled });
}
function StringNode(props) {
    var _a = react_1.useState(props.value), oldValue = _a[0], setOldValue = _a[1];
    var _b = react_1.useState(props.value), value = _b[0], setValue = _b[1];
    var setDirty = function (newValue) {
        if (oldValue !== newValue) {
            props.manageDirty.set();
        }
        else {
            props.manageDirty.remove();
        }
    };
    react_1.useEffect(function () {
        setOldValue(props.value);
        setValue(props.value);
    }, [props.value]);
    react_1.useEffect(function () {
        if (props.reset) {
            setValue(oldValue);
            props.manageDirty.remove();
        }
    }, [oldValue, props.manageDirty, props.reset]);
    var onChange = function (event, newValue) {
        props.setToUpdate();
        setValue(newValue);
        setDirty(newValue);
    };
    return (react_2["default"].createElement(material_1.TextField, { placeholder: 'Enter a string', size: "small", fullWidth: true, inputProps: { maxLength: props.attribute.Parameters.MaxLength }, value: value, onFocus: props.setToUpdate, onChange: onChange, disabled: props.disabled }));
}
function MemoNode(props) {
    var _a = react_1.useState(props.value), oldValue = _a[0], setOldValue = _a[1];
    var _b = react_1.useState(props.value), value = _b[0], setValue = _b[1];
    var setDirty = function (newValue) {
        if (oldValue !== newValue) {
            props.manageDirty.set();
        }
        else {
            props.manageDirty.remove();
        }
    };
    react_1.useEffect(function () {
        setOldValue(props.value);
        setValue(props.value);
    }, [props.value]);
    react_1.useEffect(function () {
        if (props.reset) {
            setValue(oldValue);
            props.manageDirty.remove();
        }
    }, [oldValue, props.manageDirty, props.reset]);
    var onChange = function (event, newValue) {
        setValue(newValue);
        setDirty(newValue);
    };
    return (react_2["default"].createElement(material_1.TextField, { placeholder: 'Enter a string', size: "small", fullWidth: true, multiline: true, rows: 1, inputProps: { maxLength: props.attribute.Parameters.MaxLength }, value: value, onFocus: props.setToUpdate, onChange: onChange, disabled: props.disabled }));
}
function DecimalNode(props) {
    var _a = react_1.useState(props.value ? parseInt(props.value) : null), oldValue = _a[0], setOldValue = _a[1];
    var _b = react_1.useState(props.value ? parseInt(props.value) : null), value = _b[0], setValue = _b[1];
    var setDirty = function (newValue) {
        if (oldValue !== newValue) {
            props.manageDirty.set();
        }
        else {
            props.manageDirty.remove();
        }
    };
    react_1.useEffect(function () {
        setOldValue(props.value ? parseInt(props.value) : null);
        setValue(props.value ? parseInt(props.value) : null);
    }, [props.value]);
    react_1.useEffect(function () {
        if (props.reset) {
            setValue(oldValue);
            props.manageDirty.remove();
        }
    }, [oldValue, props.manageDirty, props.reset]);
    var onChange = function (event, newValue) {
        props.setToUpdate();
        setValue(newValue ? parseInt(newValue) : null);
        setDirty(newValue ? parseInt(newValue) : null);
    };
    return (react_2["default"].createElement(material_1.TextField, { inputMode: 'decimal', size: "small", fullWidth: true, placeholder: "Decimal by " + props.attribute.Parameters.Precision, inputProps: {
            min: props.attribute.Parameters.MinValue,
            max: props.attribute.Parameters.MaxValue,
            step: props.attribute.Parameters.Precision
        }, value: value === null || value === void 0 ? void 0 : value.toString(), onFocus: props.setToUpdate, onChange: onChange, disabled: props.disabled }));
}
function DoubleNode(props) {
    var _a = react_1.useState(props.value ? parseInt(props.value) : null), oldValue = _a[0], setOldValue = _a[1];
    var _b = react_1.useState(props.value ? parseInt(props.value) : null), value = _b[0], setValue = _b[1];
    var setDirty = function (newValue) {
        if (oldValue !== newValue) {
            props.manageDirty.set();
        }
        else {
            props.manageDirty.remove();
        }
    };
    react_1.useEffect(function () {
        setOldValue(props.value ? parseInt(props.value) : null);
        setValue(props.value ? parseInt(props.value) : null);
    }, [props.value]);
    react_1.useEffect(function () {
        if (props.reset) {
            setValue(oldValue);
            props.manageDirty.remove();
        }
    }, [oldValue, props.manageDirty, props.reset]);
    var onChange = function (event, newValue) {
        props.setToUpdate();
        setValue(newValue ? parseInt(newValue) : null);
        setDirty(newValue ? parseInt(newValue) : null);
    };
    return (react_2["default"].createElement(material_1.TextField, { inputMode: 'decimal', size: "small", fullWidth: true, placeholder: "Double by " + props.attribute.Parameters.Precision, inputProps: {
            min: props.attribute.Parameters.MinValue,
            max: props.attribute.Parameters.MaxValue,
            step: props.attribute.Parameters.Precision
        }, value: value === null || value === void 0 ? void 0 : value.toString(), onFocus: props.setToUpdate, onChange: onChange, disabled: props.disabled }));
}
function MoneyNode(props) {
    var _a = react_1.useState(props.value ? parseInt(props.value) : null), oldValue = _a[0], setOldValue = _a[1];
    var _b = react_1.useState(props.value ? parseInt(props.value) : null), value = _b[0], setValue = _b[1];
    var setDirty = function (newValue) {
        if (oldValue !== newValue) {
            props.manageDirty.set();
        }
        else {
            props.manageDirty.remove();
        }
    };
    react_1.useEffect(function () {
        setOldValue(props.value ? parseInt(props.value) : null);
        setValue(props.value ? parseInt(props.value) : null);
    }, [props.value]);
    react_1.useEffect(function () {
        if (props.reset) {
            setValue(oldValue);
            props.manageDirty.remove();
        }
    }, [oldValue, props.manageDirty, props.reset]);
    var onChange = function (event, newValue) {
        props.setToUpdate();
        setValue(newValue ? parseInt(newValue) : null);
        setDirty(newValue ? parseInt(newValue) : null);
    };
    return (react_2["default"].createElement(material_1.TextField, { inputMode: 'decimal', size: "small", fullWidth: true, placeholder: "Money by " + props.attribute.Parameters.Precision, inputProps: {
            min: props.attribute.Parameters.MinValue,
            max: props.attribute.Parameters.MaxValue,
            step: props.attribute.Parameters.Precision
        }, value: value === null || value === void 0 ? void 0 : value.toString(), onFocus: props.setToUpdate, onChange: onChange, disabled: props.disabled }));
}
function IntegerNode(props) {
    var _a = react_1.useState(props.value ? parseInt(props.value) : null), oldValue = _a[0], setOldValue = _a[1];
    var _b = react_1.useState(props.value ? parseInt(props.value) : null), value = _b[0], setValue = _b[1];
    var setDirty = function (newValue) {
        if (oldValue !== newValue) {
            props.manageDirty.set();
        }
        else {
            props.manageDirty.remove();
        }
    };
    react_1.useEffect(function () {
        setOldValue(props.value ? parseInt(props.value) : null);
        setValue(props.value ? parseInt(props.value) : null);
    }, [props.value]);
    react_1.useEffect(function () {
        if (props.reset) {
            setValue(oldValue);
            props.manageDirty.remove();
        }
    }, [oldValue, props.manageDirty, props.reset]);
    var onChange = function (event, newValue) {
        props.setToUpdate();
        setValue(newValue ? parseInt(newValue) : null);
        setDirty(newValue ? parseInt(newValue) : null);
    };
    return (react_2["default"].createElement(material_1.TextField, { inputMode: 'numeric', size: "small", fullWidth: true, placeholder: "Integer", inputProps: {
            min: props.attribute.Parameters.MinValue,
            max: props.attribute.Parameters.MaxValue,
            step: props.attribute.Parameters.Precision
        }, value: value === null || value === void 0 ? void 0 : value.toString(), onFocus: props.setToUpdate, onChange: onChange, disabled: props.disabled }));
}
function BigIntNode(props) {
    var _a = react_1.useState(props.value ? parseInt(props.value) : null), oldValue = _a[0], setOldValue = _a[1];
    var _b = react_1.useState(props.value ? parseInt(props.value) : null), value = _b[0], setValue = _b[1];
    var setDirty = function (newValue) {
        if (oldValue !== newValue) {
            props.manageDirty.set();
        }
        else {
            props.manageDirty.remove();
        }
    };
    react_1.useEffect(function () {
        setOldValue(props.value ? parseInt(props.value) : null);
        setValue(props.value ? parseInt(props.value) : null);
    }, [props.value]);
    react_1.useEffect(function () {
        if (props.reset) {
            setValue(oldValue);
            props.manageDirty.remove();
        }
    }, [oldValue, props.manageDirty, props.reset]);
    var onChange = function (event, newValue) {
        props.setToUpdate();
        setValue(newValue ? parseInt(newValue) : null);
        setDirty(newValue ? parseInt(newValue) : null);
    };
    return (react_2["default"].createElement(material_1.TextField, { inputMode: 'numeric', size: "small", fullWidth: true, placeholder: "BigInt", inputProps: {
            min: props.attribute.Parameters.MinValue,
            max: props.attribute.Parameters.MaxValue,
            step: props.attribute.Parameters.Precision
        }, value: value === null || value === void 0 ? void 0 : value.toString(), onFocus: props.setToUpdate, onChange: onChange, disabled: props.disabled }));
}
function BooleanNode(props) {
    var _a = react_1.useState(props.value), oldValue = _a[0], setOldValue = _a[1];
    var _b = react_1.useState(props.value), value = _b[0], setValue = _b[1];
    var setDirty = function (checked) {
        console.log("Boolean test: " + oldValue, checked);
        if (oldValue !== checked) {
            props.manageDirty.set();
        }
        else {
            props.manageDirty.remove();
        }
    };
    react_1.useEffect(function () {
        setOldValue(props.value);
        setValue(props.value);
    }, [props.value]);
    react_1.useEffect(function () {
        if (props.reset) {
            setValue(oldValue);
            props.manageDirty.remove();
        }
    }, [oldValue, props.manageDirty, props.reset]);
    var onChange = function (event, checked) {
        setValue(checked);
        setDirty(checked);
    };
    return (react_2["default"].createElement(material_1.Checkbox, { size: "small", checked: value, onFocus: props.setToUpdate, onChange: onChange, disabled: props.disabled }));
}
function DateTimeNode(props) {
    var _a = react_1.useState(dayjs_1["default"](props.value)), oldValue = _a[0], setOldValue = _a[1];
    var _b = react_1.useState(dayjs_1["default"](props.value)), value = _b[0], setValue = _b[1];
    var setDirty = function (date) {
        console.log("debug date");
        if (oldValue !== date) {
            props.manageDirty.set();
        }
        else {
            props.manageDirty.remove();
        }
    };
    react_1.useEffect(function () {
        setOldValue(dayjs_1["default"](props.value));
        setValue(dayjs_1["default"](props.value));
    }, [props.value]);
    react_1.useEffect(function () {
        if (props.reset) {
            setValue(oldValue);
            props.manageDirty.remove();
        }
    }, [oldValue, props.manageDirty, props.reset]);
    var onChange = function (date) {
        props.setToUpdate();
        setValue(dayjs_1["default"](date));
        setDirty(dayjs_1["default"](date));
    };
    var onFormatDate = function (date) {
        return !date ? '' : date.getDate() + '/' + (date.getMonth() + 1) + '/' + (date.getFullYear());
    };
    return (react_2["default"].createElement(react_2["default"].Fragment, null, props.attribute.Parameters.Format === requestsType_1.MSDateFormat.DateOnly ?
        react_2["default"].createElement(x_date_pickers_1.DatePicker, { value: value, onChange: onChange, renderInput: function (params) { return react_2["default"].createElement(material_1.TextField, __assign({}, params, { size: "small", fullWidth: true })); }, disabled: props.disabled })
        :
            react_2["default"].createElement(x_date_pickers_1.DateTimePicker, { ampm: false, onChange: onChange, value: value, renderInput: function (params) { return (react_2["default"].createElement(material_1.TextField, __assign({}, params, { size: "small", fullWidth: true }))); }, disabled: props.disabled })));
}
// function StatusNode(props: AttributeProps) {
//     const [oldValue, setOldValue] = useState(props.value);
//     const [value, setValue] = useState(props.value)
//     const setDirty = (newOption?: typeof value) => {
//         if (oldValue !== newOption) {
//             props.manageDirty.set()
//         }
//         else {
//             props.manageDirty.remove()
//         }
//     }
//     useEffect(() => {
//         setOldValue(props.value)
//         setValue(props.value)
//     }, [props.value])
//     useEffect(() => {
//         if (props.reset) {
//             setValue(oldValue)
//             props.manageDirty.remove()
//         }
//     }, [oldValue, props.manageDirty, props.reset])
//     const onChange = (event: SelectChangeEvent) => {
//         setValue(event.target.value)
//         setDirty(event.target.value)
//     }
//     const statusOptions = RetrievePicklistValues(props.entityname, props.attribute.MStype, props.attribute.LogicalName)
//     return (<Select
//         value={value}
//         onFocus={props.setToUpdate}
//         onChange={onChange}
//         size={"small"}
//         fullWidth
//         disabled={props.disabled}
//     >
//         {
//             statusOptions?.map((option) => {
//                 return <MenuItem value={option.value}>{option.text}</MenuItem>
//             })
//         }
//     </Select>)
// }
function PicklistNode(props) {
    var _a = react_1.useState(props.value), oldValue = _a[0], setOldValue = _a[1];
    var _b = react_1.useState(props.value), value = _b[0], setValue = _b[1];
    var setDirty = function (newOption) {
        if (oldValue !== newOption) {
            props.manageDirty.set();
        }
        else {
            props.manageDirty.remove();
        }
    };
    react_1.useEffect(function () {
        setOldValue(props.value);
        setValue(props.value);
    }, [props.value]);
    react_1.useEffect(function () {
        if (props.reset) {
            setValue(oldValue);
            props.manageDirty.remove();
        }
    }, [oldValue, props.manageDirty, props.reset]);
    var onChange = function (event) {
        props.setToUpdate();
        var newValue = typeof event.target.value == 'string' ? -1 : event.target.value;
        setValue(newValue);
        setDirty(newValue);
    };
    var stateOptions = RetrievePicklistValues_1.RetrievePicklistValues(props.entityname, props.attribute.MStype, props.attribute.LogicalName);
    return (react_2["default"].createElement(material_1.Select, { multiple: props.multiple, value: value !== null && value !== void 0 ? value : -1, onFocus: props.setToUpdate, onChange: onChange, size: "small", fullWidth: true, disabled: props.disabled },
        props.nullable && react_2["default"].createElement(material_1.MenuItem, { value: -1 }, "- - -"), stateOptions === null || stateOptions === void 0 ? void 0 :
        stateOptions.map(function (option) {
            return react_2["default"].createElement(material_1.MenuItem, { value: option.value }, option.text);
        })));
}
// function PicklistNode(props: AttributeProps) {
//     const [oldValue, setOldValue] = useState(props.value);
//     const [value, setValue] = useState(props.value)
//     const setDirty = (newOption?: typeof value) => {
//         if (oldValue !== newOption) {
//             props.manageDirty.set()
//         }
//         else {
//             props.manageDirty.remove()
//         }
//     }
//     useEffect(() => {
//         setOldValue(props.value)
//         setValue(props.value)
//     }, [props.value])
//     useEffect(() => {
//         if (props.reset) {
//             setValue(oldValue)
//             props.manageDirty.remove()
//         }
//     }, [oldValue, props.manageDirty, props.reset])
//     const onChange = (event: SelectChangeEvent) => {
//         props.setToUpdate()
//         setValue(event.target.value)
//         setDirty(event.target.value)
//     }
//     const picklistOptions = RetrievePicklistValues(props.entityname, props.attribute.MStype, props.attribute.LogicalName)
//     return (<Select
//         value={value ?? -1}
//         onFocus={props.setToUpdate}
//         onChange={onChange}
//         size={"small"}
//         fullWidth
//         disabled={props.disabled}
//     >
//         <MenuItem value={-1}>- - -</MenuItem>
//         {
//             picklistOptions?.map((option) => {
//                 return <MenuItem value={option.value}>{option.text}</MenuItem>
//             })
//         }
//     </Select>)
// }
// function MultiSelectPicklistNode(props: AttributeProps) {
//     const [oldValue, setOldValue] = useState<string[]>(props.value?.split(','));
//     const [valueList, setValue] = useState<string[]>(props.value?.split(','))
//     const setDirty = (option?: string[]) => {
//         if (oldValue !== option) {
//             props.manageDirty.set()
//         }
//         else {
//             props.manageDirty.remove()
//         }
//     }
//     useEffect(() => {
//         setOldValue(props.value?.split(','))
//         setValue(props.value?.split(','))
//     }, [props.value])
//     useEffect(() => {
//         if (props.reset) {
//             setValue(oldValue)
//             props.manageDirty.remove()
//         }
//     }, [oldValue, props.manageDirty, props.reset])
//     const onChange = (event: SelectChangeEvent<typeof valueList>) => {
//         props.setToUpdate()
//         const {
//             target: { value: value },
//         } = event;
//         setValue(typeof value === 'string' ? value.split(',') : value,)
//         setDirty(typeof value === 'string' ? value.split(',') : value,)
//     }
//     const multiSelectPicklistOptions = RetrievePicklistValues(props.entityname, props.attribute.MStype, props.attribute.LogicalName)
//     return (<Select
//         multiple
//         value={valueList}
//         onFocus={props.setToUpdate}
//         onChange={onChange}
//         size={"small"}
//         fullWidth
//         disabled={props.disabled}
//     >
//         {
//             multiSelectPicklistOptions?.map((option) => {
//                 return <MenuItem value={option.value}>{option.text}</MenuItem>
//             })
//         }
//     </Select>)
// }
function ImageNode(props) {
    return (react_2["default"].createElement("img", null));
}
function NavTopBar(props) {
    return (react_2["default"].createElement(system_1.Stack, { key: "topbar", spacing: 0.5, width: "100%" },
        react_2["default"].createElement(system_1.Stack, { direction: "row", key: "entityrecordselectors", spacing: 0.5, width: "100%" },
            react_2["default"].createElement(EntitySelector, { setEntityname: props.setEntityname, entityname: props.entityname }),
            react_2["default"].createElement(RecordSelector, { setRecordid: props.setRecordid, entityname: props.entityname, recordid: props.recordid }),
            react_2["default"].createElement(material_1.Button, { onClick: props.setCurrentRecord }, "Refresh")),
        react_2["default"].createElement(system_1.Stack, { direction: "row", key: "attributesselector", spacing: 0.5, width: "100%" },
            react_2["default"].createElement(exports.FilterInput, { returnFilterInput: props.setFilterAttribute, key: 'attributefilterinput', placeholder: 'Filter attributes' }),
            react_2["default"].createElement(material_1.Button, { variant: 'contained', key: 'updatebutton', onClick: props.launchUpdate },
                react_2["default"].createElement(Sync_1["default"], null)))));
}
exports.FilterInput = function (props) {
    var _a = react_1.useState(""), value = _a[0], setValue = _a[1];
    return (react_2["default"].createElement(material_1.FormControl, { size: 'small', fullWidth: true },
        react_2["default"].createElement(material_1.TextField, { size: 'small', inputMode: 'search', value: value, onChange: function (e) {
                var _a, _b;
                setValue((_a = e === null || e === void 0 ? void 0 : e.target.value) !== null && _a !== void 0 ? _a : "");
                props.returnFilterInput((_b = e === null || e === void 0 ? void 0 : e.target.value) !== null && _b !== void 0 ? _b : "");
            }, placeholder: props.placeholder, fullWidth: true, InputProps: {
                startAdornment: (react_2["default"].createElement(material_1.InputAdornment, { position: "start" },
                    react_2["default"].createElement(FilterAlt_1["default"], null))),
                endAdornment: (react_2["default"].createElement(material_1.IconButton, { sx: { visibility: value ? "visible" : "hidden" }, onClick: function () {
                        setValue("");
                        props.returnFilterInput("");
                    } },
                    react_2["default"].createElement(Clear_1["default"], null)))
            } })));
};
var EntitySelector = function (props) {
    var entitiesRetrieved = RetrieveEntities_1.RetrieveEntities();
    var _a = react_1.useState(), entities = _a[0], setEntities = _a[1];
    var _b = react_1.useState({ id: props.entityname, label: "Loading..." }), value = _b[0], setValue = _b[1];
    var _c = react_1.useState([]), options = _c[0], setOptions = _c[1];
    var entityname = props.entityname;
    react_1.useEffect(function () {
        setEntities(entitiesRetrieved);
    }, [entitiesRetrieved]);
    react_1.useEffect(function () {
        var _a;
        setOptions((_a = entities === null || entities === void 0 ? void 0 : entities.map(function (value, index, array) {
            return { id: value.logicalname, label: value.name };
        })) !== null && _a !== void 0 ? _a : []);
    }, [entities]);
    react_1.useEffect(function () {
        var _a;
        setValue((_a = options.find(function (o) { return o.id === entityname; })) !== null && _a !== void 0 ? _a : { id: entityname, label: "" });
    }, [entityname, options]);
    return (react_2["default"].createElement(material_1.FormControl, { size: 'small', fullWidth: true },
        react_2["default"].createElement(material_1.Autocomplete, { size: 'small', options: options, getOptionLabel: function (option) { return option.label; }, 
            // styles={comboBoxStyles}
            // Force re-creating the component when the toggles change (for demo purposes)
            key: 'entityselector', placeholder: 'Search entity', onChange: function (event, option, index) { var _a; props.setEntityname((_a = option === null || option === void 0 ? void 0 : option.id.toString()) !== null && _a !== void 0 ? _a : ""); }, value: value, renderInput: function (params) { return react_2["default"].createElement(material_1.TextField, __assign({}, params)); }, fullWidth: true })));
};
var RecordSelector = function (props) {
    var setRecordid = props.setRecordid, entityname = props.entityname, recordid = props.recordid, disabled = props.disabled;
    var _a = react_1.useState([recordid]), recordsIds = _a[0], setRecordsIds = _a[1];
    var recordsDisplayNames = RetrieveRecordsDisplayNames_1.RetrieveRecordsDisplayNames(entityname, recordsIds);
    var _b = usehooks_ts_1.useBoolean(false), isDialogOpen = _b.value, setDialogOpen = _b.setValue, openDialog = _b.setTrue, closeDialog = _b.setFalse, toggleDialog = _b.toggle;
    react_1.useEffect(function () {
        setRecordsIds([recordid]);
    }, [recordid]);
    return (react_2["default"].createElement(react_2["default"].Fragment, null,
        react_2["default"].createElement(material_1.TextField, { size: 'small', fullWidth: true, placeholder: 'Search ' + entityname, onClick: openDialog, InputProps: {
                endAdornment: (react_2["default"].createElement(material_1.InputAdornment, { position: "end" },
                    react_2["default"].createElement(Search_1["default"], null))),
                readOnly: true,
                style: { cursor: !disabled ? "pointer" : "auto" }
            }, inputProps: {
                style: { cursor: !disabled ? "pointer" : "auto" }
            }, sx: { cursor: !disabled ? "pointer" : "auto" }, value: recordsDisplayNames.map(function (r) { return r.displayName; }).join(", "), disabled: disabled }),
        !disabled && react_2["default"].createElement(RecordSelectorDialog, { closeDialog: closeDialog, entityname: entityname, open: isDialogOpen, records: recordsIds, setRecordsIds: setRecordsIds })));
};
var RecordSelectorDialog = function (props) {
    var _a;
    var closeDialog = props.closeDialog, open = props.open, entityname = props.entityname, records = props.records, registerRecords = props.setRecordsIds, multiple = props.multiple;
    var primaryNameLogicalName = RetrievePrimaryAttribute_1.RetrievePrimaryAttribute(entityname);
    var _b = react_1.useState(records), selectedRecordsIds = _b[0], setSelectedRecordsIds = _b[1];
    var entityMetadata = RetrieveAttributesMetaData_1.RetrieveAttributesMetaData(entityname);
    var allRecords = RetrieveAllRecords_1.RetrieveAllRecords(entityname, (_a = entityMetadata === null || entityMetadata === void 0 ? void 0 : entityMetadata.map(function (value) {
        if (value.MStype !== requestsType_1.MSType.Lookup)
            return value.LogicalName;
        else
            return "_" + value.LogicalName + "_value";
    })) !== null && _a !== void 0 ? _a : []);
    react_1.useEffect(function () {
        setSelectedRecordsIds(records);
    }, [open]);
    var addRecord = function (row) {
        if (multiple) {
            setSelectedRecordsIds(__spreadArrays(selectedRecordsIds, [row[entityname + "id"]]));
        }
        else {
            setSelectedRecordsIds([row[entityname + "id"]]);
        }
    };
    var onClose = function () {
        closeDialog();
    };
    var columns = react_1.useMemo(function () {
        return entityMetadata.map(function (meta) {
            return {
                field: meta.LogicalName,
                headerName: meta.DisplayName,
                resizable: true,
                hideable: meta.LogicalName != primaryNameLogicalName,
                hide: meta.LogicalName != primaryNameLogicalName
            };
        });
    }, [entityMetadata]);
    var rows = react_1.useMemo(function () {
        return selectedRecordsIds.map(function (record) {
            return {
                id: record
            };
        });
    }, [selectedRecordsIds]);
    return (react_2["default"].createElement(material_1.Dialog, { onClose: onClose, open: open, maxWidth: false },
        react_2["default"].createElement(material_1.DialogTitle, null,
            react_2["default"].createElement(system_1.Stack, { direction: "row", spacing: "5px", justifyContent: "space-between" })),
        react_2["default"].createElement(material_1.DialogContent, { style: { height: "55vh", width: "55vw" } },
            react_2["default"].createElement(x_data_grid_1.DataGrid, { rows: allRecords, columns: columns, pageSize: 25, checkboxSelection: multiple !== null && multiple !== void 0 ? multiple : false, onRowClick: function (params) {
                    addRecord(params.row);
                }, onRowDoubleClick: function (params) {
                    addRecord(params.row);
                }, components: {
                    Toolbar: CustomToolBar,
                    Pagination: CustomPagination
                }, getRowId: function (row) { return row[entityname + "id"]; } })),
        react_2["default"].createElement(core_1.DialogActions, null,
            react_2["default"].createElement(material_1.Button, { onClick: onClose, variant: 'contained' }, "Close"))));
};
function CustomToolBar() {
    return (react_2["default"].createElement(react_2["default"].Fragment, null,
        react_2["default"].createElement(x_data_grid_1.GridToolbar, null),
        react_2["default"].createElement(exports.FilterInput, { returnFilterInput: function () { }, placeholder: 'Search Records' })));
}
function CustomPagination() {
    var apiRef = x_data_grid_1.useGridApiContext();
    var page = x_data_grid_1.useGridSelector(apiRef, x_data_grid_1.gridPageSelector);
    var pageCount = x_data_grid_1.useGridSelector(apiRef, x_data_grid_1.gridPageCountSelector);
    return (react_2["default"].createElement(material_1.Pagination, { color: "primary", count: pageCount, page: page + 1, onChange: function (event, value) { return apiRef.current.setPage(value - 1); } }));
}
var updateRecord = new UpdateRecordButton();
exports["default"] = updateRecord;
