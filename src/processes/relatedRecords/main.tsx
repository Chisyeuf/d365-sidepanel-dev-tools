import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import createTheme from '@mui/material/styles/createTheme';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import ShareIcon from '@mui/icons-material/Share';

import { RetrieveRelationShipManyToMany } from '../../utils/hooks/XrmApi/RetrieveRelationShipManyToMany';
import { RetrieveRelationShipManyToOne } from '../../utils/hooks/XrmApi/RetrieveRelationShipManyToOne';
import { RetrieveRelationShipOneToMany } from '../../utils/hooks/XrmApi/RetrieveRelationShipOneToMany';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { RelationShipMetadata, RelationshipType } from '../../utils/types/requestsType';
import { RetrieveRelatedRecords } from '../../utils/hooks/XrmApi/RetrieveRelatedRecords';
import { debugLog } from '../../utils/global/common';
import { Theme, ThemeProvider } from '@emotion/react';
import { RetrievePrimaryNameAttribute } from '../../utils/hooks/XrmApi/RetrievePrimaryNameAttribute';
import { useHover } from 'usehooks-ts';
import { useCurrentRecord } from '../../utils/hooks/use/useCurrentRecord';
import RecordSearchBar from '../../utils/components/RecordSearchBar';
import RecordContextualMenu from '../../utils/components/RecordContextualMenu';
import { RetrieveAttributes } from '../../utils/hooks/XrmApi/RetrieveAttributes';
import FilterInput from '../../utils/components/FilterInput';
import { NoMaxWidthTooltip } from '../../utils/components/NoMaxWidthTooltip';
import DontShowInfo from '../../utils/components/DontShowInfo';
import TooltipInfo from '../../utils/components/TooltipInfo';

const theme = createTheme({
    components: {
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontSize: '0.85rem',
                    lineHeight: '1',
                }
            }
        },
    }
});

class RelatedRecordsButton extends ProcessButton {
    constructor() {
        super(
            'relatedRecords',
            'Related Records',
            <ShareIcon />,
            450
        );
        this.process = RelatedRecordsProcess;
        this.description = <>
            <Typography><i>Explore entity relationships and related records.</i></Typography>
            <Typography>This tool displays <b>all relationships associated</b> with the selected entity. It also lists <b>related records</b> for the selected record.</Typography>
            <Typography><u>To view a record in detail, click on it to open a dialog</u>. Alternatively, you can access a contextual menu <i>(right-click)</i> for other opening options.</Typography>
        </>
    }
}

const RelatedRecordsProcess = forwardRef<ProcessRef, ProcessProps>(
    function RelatedRecordsProcess(props: ProcessProps, ref) {

        const { entityName: currentEntityName, recordId: currentRecordId, isEntityRecord } = useCurrentRecord();

        const [loading, setLoading] = useState<boolean>(true);

        const [entityName, _setEntityName] = useState<string>(currentEntityName ?? '');
        const [recordId, setRecordId] = useState<string[]>([currentRecordId ?? '']);

        const [filter, setFilter] = useState<string>('');

        const firstRecordId = useMemo(() => recordId.at(0) ?? '', [recordId]);

        const resetRecord = useCallback(() => {
            _setEntityName(currentEntityName ?? '');
            setRecordId([]);
            setTimeout(() => {
                setRecordId([currentRecordId ?? '']);
            }, 100);
        }, [currentEntityName, currentRecordId, _setEntityName, setRecordId]);

        useEffect(() => {
            if (loading) {
                if (currentEntityName && currentRecordId) {
                    resetRecord();
                    setLoading(false);
                }
            }
        }, [currentEntityName, currentRecordId, loading, resetRecord]);

        const setEntityName = useCallback((newValue: string) => {
            _setEntityName(newValue);
            setLoading(false);
        }, []);

        const [manyToMany, isManyToManyFetching] = RetrieveRelationShipManyToMany(entityName);
        const [oneToMany, isOneToManyFetching] = RetrieveRelationShipOneToMany(entityName);
        const [manyToOne, isManyToOneFetching] = RetrieveRelationShipManyToOne(entityName);

        return (
            <ThemeProvider theme={theme}>
                <Stack spacing={0.5} height='calc(100% - 10px)' padding='10px' pr={0} alignItems='center' overflow='scroll'>

                    <DontShowInfo storageName={`${props.id}-maininfo`}>
                        <Typography variant='body2' fontSize='unset' lineHeight='unset'>Click on a record row to open the main form in a dialog.</Typography>
                        <Typography variant='body2' fontSize='unset' lineHeight='unset'>By right-clicking, you can access a context menu that allows you to open the record in a new tab.</Typography>
                    </DontShowInfo>

                    <Stack direction='column' spacing={1} py={0.5}>
                        <RecordSearchBar entityName={entityName} recordIds={recordId} setEntityName={setEntityName} setRecordIds={setRecordId} reset={resetRecord} theme={theme} />
                        <FilterInput fullWidth placeholder='Search by name' returnFilterInput={setFilter} />
                    </Stack>

                    {!isManyToManyFetching && <RelationShipList title='Many To Many' relationShipMetadata={manyToMany} key={'manytomany'} entityName={entityName} recordId={firstRecordId} filter={filter} />}

                    {!isOneToManyFetching && <RelationShipList title='One To Many' relationShipMetadata={oneToMany} key={'oneToMany'} entityName={entityName} recordId={firstRecordId} filter={filter} />}

                    {!isManyToOneFetching && <RelationShipList title='Many To One' relationShipMetadata={manyToOne} key={'manyToOne'} entityName={entityName} recordId={firstRecordId} filter={filter} />}
                </Stack>
            </ThemeProvider>
        );
    }
);

interface RelationShipListProps<T extends RelationShipMetadata> {
    title: string,
    relationShipMetadata: T[],
    entityName: string,
    recordId: string,
    filter: string
}
function RelationShipList<T extends RelationShipMetadata>(props: RelationShipListProps<T>) {

    const { relationShipMetadata: relationShipMetadataList, title, entityName, recordId, filter } = props;

    const [open, setOpen] = useState(false);
    const [sortArray, setSortArray] = useState<(number | undefined)[]>([]);

    const saveSorting = useCallback((index: number, numberOfItem: number) => {
        setSortArray(prev => {
            const newSort = [...prev];
            newSort[index] = numberOfItem;
            return newSort;
        })
    }, [setSortArray]);


    const handleClick = () => {
        setOpen(prev => !prev);
    };

    const numberOfRelationshipChip = useRef(null);
    const numberOfRelationshipChipHovered = useHover(numberOfRelationshipChip);

    const numberOfRelationshipBig = useMemo(() => {
        if (!relationShipMetadataList) return '?';
        return relationShipMetadataList.length;
    }, [relationShipMetadataList]);

    const numberOfRelationshipSmall = useMemo(() => {
        if (!relationShipMetadataList) return '?';
        const max = 999;
        return relationShipMetadataList.length > max ? max + '+' : relationShipMetadataList.length;
    }, [relationShipMetadataList]);

    useEffect(() => {
        setSortArray((new Array(relationShipMetadataList.length)).fill(-1));
    }, [relationShipMetadataList])


    const relationShipItems = useMemo(() => relationShipMetadataList.map((relationShip, index) => {
        return (
            <RelationShipItem
                key={relationShip.SchemaName}
                relationShipMetadata={relationShip}
                entityName={entityName}
                recordId={recordId}
                index={index}
                sendContentToParent={saveSorting}
                filter={filter}
            />
        )
    }), [relationShipMetadataList, entityName, recordId, saveSorting, filter]);

    return (
        <>
            <Divider variant="middle" flexItem />
            <List
                sx={{ width: '100%', bgcolor: 'background.paper' }}
                component="nav"
                aria-labelledby="nested-list-subheader"
                subheader={
                    <ListItemButton component="div" id="nested-list-subheader" onClick={handleClick}>
                        <ListItemIcon>
                            <Chip ref={numberOfRelationshipChip} size="small" label={numberOfRelationshipChipHovered ? numberOfRelationshipBig : numberOfRelationshipSmall} />
                        </ListItemIcon>
                        <ListItemText primary={title} />
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                }
            >
                <Collapse in={open} timeout="auto" unmountOnExit mountOnEnter>
                    {
                        sortArray.map((s, index) => ({ index: index, number: s })).sort((pA, pB) => pA.number !== undefined && pB.number !== undefined ? pB.number - pA.number : -1)
                            .map(position => relationShipItems[position.index])
                    }
                </Collapse>
            </List>
        </>
    );
}

const sxTooltip: any = { p: '0px 16px' };

interface RelationShipItemProps {
    relationShipMetadata: RelationShipMetadata,
    entityName: string,
    recordId: string,
    index: number,
    sendContentToParent: (index: number, numberOfItem: number) => void,
    filter: string
}
const RelationShipItem = React.memo((props: RelationShipItemProps) => {
    const { relationShipMetadata, entityName, recordId, sendContentToParent, index, filter } = props;

    const [open, setOpen] = useState(false);


    const relationShipFetchInfo = useMemo(() => {
        debugLog("relationShipFetchInfo", relationShipMetadata.SchemaName, relationShipMetadata.RelationshipType);
        switch (relationShipMetadata.RelationshipType) {
            case RelationshipType.ManyToManyRelationship:
                if (relationShipMetadata.Entity1LogicalName === entityName) {
                    return [{
                        relationshipSchemaName: relationShipMetadata.SchemaName,
                        entityName: relationShipMetadata.Entity2LogicalName,
                        navigationPropertyName: relationShipMetadata.Entity1NavigationPropertyName
                    }];
                }
                else {
                    return [{
                        relationshipSchemaName: relationShipMetadata.SchemaName,
                        entityName: relationShipMetadata.Entity1LogicalName,
                        navigationPropertyName: relationShipMetadata.Entity2NavigationPropertyName
                    }];
                }
            case RelationshipType.OneToManyRelationship:
                return [{
                    relationshipSchemaName: relationShipMetadata.SchemaName,
                    entityName: relationShipMetadata.ReferencingEntity,
                    navigationPropertyName: relationShipMetadata.ReferencedEntityNavigationPropertyName
                }];
            case RelationshipType.ManyToOneRelationship:
                return [{
                    relationshipSchemaName: relationShipMetadata.SchemaName,
                    entityName: relationShipMetadata.ReferencedEntity,
                    navigationPropertyName: relationShipMetadata.ReferencingEntityNavigationPropertyName
                }];
        }
    }, [entityName, relationShipMetadata]);

    const [relatedRecordsDict, isFetching] = RetrieveRelatedRecords(entityName, recordId, relationShipFetchInfo);

    const relatedRecords = useMemo(() => {
        return relatedRecordsDict[relationShipMetadata.SchemaName];
    }, [relatedRecordsDict, relationShipMetadata.SchemaName]);


    const numberOfRecordsChip = useRef(null);
    const numberOfRecordsChipHovered = useHover(numberOfRecordsChip);

    const numberOfRecordsBig = useMemo(() => {
        if (relatedRecords === undefined) return '?';
        return relatedRecords?.length ?? 0;
    }, [relatedRecords]);

    const numberOfRecordsSmall = useMemo(() => {
        if (relatedRecords === undefined) return '?';
        if (relatedRecords === null) return 0;
        return relatedRecords.length > 9 ? '9+' : relatedRecords.length;
    }, [relatedRecords]);

    useEffect(() => {
        sendContentToParent(index, relatedRecords?.length ?? -1);
    }, [relatedRecords, index, sendContentToParent]);


    const handleClick = () => {
        setOpen(prev => !prev);
    };


    const tooltipContent = useMemo(() => {
        let details;
        switch (relationShipMetadata.RelationshipType) {
            case RelationshipType.ManyToManyRelationship:
                details = <>
                    <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>Entity1LogicalName:</strong> <i>{'' + relationShipMetadata.Entity1LogicalName}</i></Typography></ListItemText></ListItem>
                    <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>Entity1NavigationPropertyName:</strong> <i>{'' + relationShipMetadata.Entity1NavigationPropertyName}</i></Typography></ListItemText></ListItem>
                    <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>Entity1IntersectAttribute:</strong> <i>{relationShipMetadata.Entity1IntersectAttribute}</i></Typography></ListItemText></ListItem>
                    <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>Entity2LogicalName:</strong> <i>{relationShipMetadata.Entity2LogicalName}</i></Typography></ListItemText></ListItem>
                    <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>Entity2NavigationPropertyName:</strong> <i>{relationShipMetadata.Entity2NavigationPropertyName}</i></Typography></ListItemText></ListItem>
                    <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>Entity2IntersectAttribute:</strong> <i>{relationShipMetadata.Entity2IntersectAttribute}</i></Typography></ListItemText></ListItem>
                    <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>IntersectEntityName:</strong> <i>{relationShipMetadata.IntersectEntityName}</i></Typography></ListItemText></ListItem>
                </>;
                break;
            default:
                details = <>
                    <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>ReferencedEntity:</strong> <i>{relationShipMetadata.ReferencedEntity}</i></Typography></ListItemText></ListItem>
                    <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>ReferencedAttribute:</strong> <i>{relationShipMetadata.ReferencedAttribute}</i></Typography></ListItemText></ListItem>
                    <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>ReferencedEntityNavigationPropertyName:</strong> <i>{relationShipMetadata.ReferencedEntityNavigationPropertyName}</i></Typography></ListItemText></ListItem>
                    <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>ReferencingEntity:</strong> <i>{relationShipMetadata.ReferencingEntity}</i></Typography></ListItemText></ListItem>
                    <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>ReferencingAttribute:</strong> <i>{relationShipMetadata.ReferencingAttribute}</i></Typography></ListItemText></ListItem>
                    <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>ReferencingEntityNavigationPropertyName:</strong> <i>{relationShipMetadata.ReferencingEntityNavigationPropertyName}</i></Typography></ListItemText></ListItem>
                    <Divider component='li' sx={{ my: 0.5, mb: 1 }} />
                    <ListItem sx={sxTooltip}>
                        <List subheader={<Typography variant="body2"><strong>CascadeConfiguration:</strong></Typography>}>
                            <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>Archive -</strong> <i>{relationShipMetadata.CascadeConfiguration.Archive}</i></Typography></ListItemText></ListItem>
                            <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>Assign -</strong> <i>{relationShipMetadata.CascadeConfiguration.Assign}</i></Typography></ListItemText></ListItem>
                            <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>Delete -</strong> <i>{relationShipMetadata.CascadeConfiguration.Delete}</i></Typography></ListItemText></ListItem>
                            <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>Merge -</strong> <i>{relationShipMetadata.CascadeConfiguration.Merge}</i></Typography></ListItemText></ListItem>
                            <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>Reparent -</strong> <i>{relationShipMetadata.CascadeConfiguration.Reparent}</i></Typography></ListItemText></ListItem>
                            <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>RollupView -</strong> <i>{relationShipMetadata.CascadeConfiguration.RollupView}</i></Typography></ListItemText></ListItem>
                            <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>Share -</strong> <i>{relationShipMetadata.CascadeConfiguration.Share}</i></Typography></ListItemText></ListItem>
                            <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>Unshare -</strong> <i>{relationShipMetadata.CascadeConfiguration.Unshare}</i></Typography></ListItemText></ListItem>
                        </List>
                    </ListItem>
                </>;
                break;
        }
        return (
            <List sx={{ p: '0px 16px' }} subheader={<Typography variant="button"><strong>{relationShipMetadata.SchemaName}</strong></Typography>}>
                <ListItem sx={{ ...sxTooltip, mt: 0.5 }}><ListItemText><Typography variant="body2"><strong>IsCustomRelationship:</strong> <i>{String(relationShipMetadata.IsCustomRelationship)}</i></Typography></ListItemText></ListItem>
                <ListItem sx={sxTooltip}><ListItemText><Typography variant="body2"><strong>IsValidForAdvancedFind:</strong> <i>{String(relationShipMetadata.IsValidForAdvancedFind)}</i></Typography></ListItemText></ListItem>
                {details}
            </List>
        );
    }, [relationShipMetadata]);

    const isVisible = useMemo(() => relationShipMetadata.SchemaName.toLowerCase().includes(filter.toLowerCase()), [filter, relationShipMetadata.SchemaName]);


    return (
        <ListItem key={"relationshipitem" + relationShipMetadata.SchemaName} sx={{ p: 0, flexDirection: 'column', alignItems: 'stretch' }}>
            <TooltipInfo enterDelay={500} title={tooltipContent} arrow placement='left' disableFocusListener maxWidth={false}>
                <ListItemButton onClick={handleClick} sx={{ display: isVisible ? 'flex' : 'none' }}>
                    <ListItemIcon>
                        <SubdirectoryArrowRightIcon />
                        <Chip ref={numberOfRecordsChip} size="small" label={isFetching ? <CircularProgress disableShrink size={10} /> : (numberOfRecordsChipHovered ? numberOfRecordsBig : numberOfRecordsSmall)} sx={{ height: 'unset' }} />
                    </ListItemIcon>
                    <ListItemText
                        primary={relationShipMetadata.SchemaName}
                        title={relationShipMetadata.SchemaName}
                        primaryTypographyProps={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    />
                    {numberOfRecordsBig !== '?' && numberOfRecordsBig > 0 ? open ? <ExpandLess /> : <ExpandMore /> : null}
                </ListItemButton>
            </TooltipInfo>
            {
                <List component="div" disablePadding sx={{ display: isVisible ? 'block' : 'none' }}>
                    <Collapse in={open} timeout="auto" unmountOnExit mountOnEnter>
                        {
                            relatedRecords?.map(relatedRecord => {
                                return (
                                    <RelatedRecordsItem entityName={relatedRecord.entityType} recordId={relatedRecord.id} key={relatedRecord.id} />
                                );
                            })
                        }
                    </Collapse>
                </List>
            }
        </ListItem>
    );
});

interface RelatedRecordsItemProps {
    entityName: string,
    recordId: string,
}
const RelatedRecordsItem = React.memo((props: RelatedRecordsItemProps) => {
    const { entityName, recordId } = props;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const primaryNameAttribute = RetrievePrimaryNameAttribute(entityName);
    const [recordFetched, isFetching] = RetrieveAttributes(entityName, recordId, [primaryNameAttribute]);
    const displayName: string = useMemo(() => primaryNameAttribute && recordFetched[primaryNameAttribute], [recordFetched, primaryNameAttribute]);

    const handleOpenContextualMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(e.currentTarget);
        e.preventDefault();
    }
    const handleCloseContextualMenu = () => {
        setAnchorEl(null);
    }

    const handleClick = () => {
        if (!entityName || !recordId) return;
        Xrm.Utility.showProgressIndicator(`Opening ${displayName} (${entityName}/${recordId})`);
        setTimeout(() => {
            Xrm.Utility.closeProgressIndicator();
        }, 1000);

        Xrm.Navigation.navigateTo(
            {
                pageType: 'entityrecord',
                entityName: entityName,
                entityId: recordId,
            },
            {
                target: 2,
                height: { value: 80, unit: "%" },
                width: { value: 70, unit: "%" },
                position: 1
            });
    }

    return (
        <ListItem key={"relatedrecorditem" + recordId} sx={{ p: 0 }}>
            <ListItemButton sx={{ pl: 4 }} onContextMenu={handleOpenContextualMenu} onClick={handleClick}>
                <ListItemText primary={<><b>{displayName || 'No name'}</b> <i>({recordId})</i></>} />
            </ListItemButton>
            <RecordContextualMenu anchorElement={anchorEl} entityName={entityName} recordId={recordId} open={!!anchorEl} onClose={handleCloseContextualMenu} />
        </ListItem>
    )
});


const relatedRecords = new RelatedRecordsButton();
export default relatedRecords;