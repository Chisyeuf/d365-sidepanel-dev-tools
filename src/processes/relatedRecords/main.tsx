
import { Chip, Collapse, Divider, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography, createTheme } from '@mui/material';
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
import { ThemeProvider } from '@emotion/react';
import { RetrievePrimaryNameAttribute } from '../../utils/hooks/XrmApi/RetrievePrimaryNameAttribute';
import { useHover } from 'usehooks-ts';
import { useCurrentRecord } from '../../utils/hooks/use/useCurrentRecord';
import RecordSearchBar from '../../utils/components/RecordSearchBar';
import RecordContextualMenu from '../../utils/components/RecordContextualMenu';
import { RetrieveAttributes } from '../../utils/hooks/XrmApi/RetrieveAttributes';
import FilterInput from '../../utils/components/FilterInput';
import { NoMaxWidthTooltip } from '../../utils/components/NoMaxWidthTooltip';

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
    }
}

const RelatedRecordsProcess = forwardRef<ProcessRef, ProcessProps>(
    function RelatiedRecordsProcess(props: ProcessProps, ref) {

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
        }, [currentEntityName, currentRecordId, resetRecord]);

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
                    <RecordSearchBar entityName={entityName} recordIds={recordId} setEntityName={setEntityName} setRecordIds={setRecordId} reset={resetRecord} theme={theme} />
                    <FilterInput fullWidth placeholder='Search by name' returnFilterInput={setFilter} />

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
        if (!relatedRecords) return '?';
        return relationShipMetadataList.length;
    }, [relatedRecords]);
    const numberOfRelationshipSmall = useMemo(() => {
        if (!relatedRecords) return '?';
        const max = 999;
        return relationShipMetadataList.length > max ? max + '+' : relationShipMetadataList.length;
    }, [relatedRecords]);

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
                <Collapse in={open} timeout="auto">
                    {
                        sortArray.map((s, index) => ({ index: index, number: s })).sort((pA, pB) => pA.number !== undefined && pB.number !== undefined ? pB.number - pA.number : -1)
                            .map(position => relationShipItems[position.index])
                    }
                </Collapse>
            </List>
        </>
    );
}

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
    }, [relationShipMetadata]);

    const [relatedRecordsDict, isFetching] = RetrieveRelatedRecords(entityName, recordId, relationShipFetchInfo);
    const relatedRecords = useMemo(() => {
        return relatedRecordsDict[relationShipMetadata.SchemaName];
    }, [relatedRecordsDict]);


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


    const tooltipText = useMemo(() => {
        var details;
        switch (relationShipMetadata.RelationshipType) {
            case RelationshipType.ManyToManyRelationship:
                details = <>
                    <Typography variant="body2"><strong>Entity1LogicalName:</strong> {'' + relationShipMetadata.Entity1LogicalName}</Typography>
                    <Typography variant="body2"><strong>Entity1NavigationPropertyName:</strong> {'' + relationShipMetadata.Entity1NavigationPropertyName}</Typography>
                    <Typography variant="body2"><strong>Entity1IntersectAttribute:</strong> {relationShipMetadata.Entity1IntersectAttribute}</Typography>
                    <Typography variant="body2"><strong>Entity2LogicalName:</strong> {relationShipMetadata.Entity2LogicalName}</Typography>
                    <Typography variant="body2"><strong>Entity2NavigationPropertyName:</strong> {relationShipMetadata.Entity2NavigationPropertyName}</Typography>
                    <Typography variant="body2"><strong>Entity2IntersectAttribute:</strong> {relationShipMetadata.Entity2IntersectAttribute}</Typography>
                    <Typography variant="body2"><strong>IntersectEntityName:</strong> {relationShipMetadata.IntersectEntityName}</Typography>
                </>;
                break;
            default:
                details = <>
                    <Typography variant="body2"><strong>ReferencedEntity:</strong> {relationShipMetadata.ReferencedEntity}</Typography>
                    <Typography variant="body2"><strong>ReferencedAttribute:</strong> {relationShipMetadata.ReferencedAttribute}</Typography>
                    <Typography variant="body2"><strong>ReferencedEntityNavigationPropertyName:</strong> {relationShipMetadata.ReferencedEntityNavigationPropertyName}</Typography>
                    <Typography variant="body2"><strong>ReferencingEntity:</strong> {relationShipMetadata.ReferencingEntity}</Typography>
                    <Typography variant="body2"><strong>ReferencingAttribute:</strong> {relationShipMetadata.ReferencingAttribute}</Typography>
                    <Typography variant="body2"><strong>ReferencingEntityNavigationPropertyName:</strong> {relationShipMetadata.ReferencingEntityNavigationPropertyName}</Typography>
                    <Divider variant='middle' />
                    <Typography variant="body2"><strong>CascadeConfiguration:</strong></Typography>
                    <Typography variant="body2">Archive - {relationShipMetadata.CascadeConfiguration.Archive}</Typography>
                    <Typography variant="body2">Assign - {relationShipMetadata.CascadeConfiguration.Assign}</Typography>
                    <Typography variant="body2">Delete - {relationShipMetadata.CascadeConfiguration.Delete}</Typography>
                    <Typography variant="body2">Merge - {relationShipMetadata.CascadeConfiguration.Merge}</Typography>
                    <Typography variant="body2">Reparent - {relationShipMetadata.CascadeConfiguration.Reparent}</Typography>
                    <Typography variant="body2">RollupView - {relationShipMetadata.CascadeConfiguration.RollupView}</Typography>
                    <Typography variant="body2">Share - {relationShipMetadata.CascadeConfiguration.Share}</Typography>
                    <Typography variant="body2">Unshare - {relationShipMetadata.CascadeConfiguration.Unshare}</Typography>

                </>;
                break;
        }
        return <>
            <Typography variant="button"><strong>{relationShipMetadata.SchemaName}</strong></Typography>
            <Typography variant="body2"><strong>IsCustomRelationship:</strong> {relationShipMetadata.IsCustomRelationship}</Typography>
            <Typography variant="body2"><strong>IsValidForAdvancedFind:</strong> {relationShipMetadata.IsValidForAdvancedFind}</Typography>
            {details}
        </>
    }, [relationShipMetadata]);

    const isVisible = useMemo(() => relationShipMetadata.SchemaName.toLowerCase().includes(filter.toLowerCase()), [filter]);

    useEffect(() => {
        debugLog('filter', filter);
    }, [filter])


    return (
        <>
            <NoMaxWidthTooltip enterDelay={500} title={tooltipText} arrow placement='left' disableFocusListener>
                <ListItemButton onClick={handleClick} sx={{ display: isVisible ? 'flex' : 'none' }}>
                    <ListItemIcon>
                        <SubdirectoryArrowRightIcon />
                        <Chip ref={numberOfRecordsChip} size="small" label={numberOfRecordsChipHovered ? numberOfRecordsBig : numberOfRecordsSmall} sx={{ height: 'unset' }} />
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
            </NoMaxWidthTooltip>
            {
                <List component="div" disablePadding sx={{ display: isVisible ? 'block' : 'none' }}>
                    <Collapse in={open} timeout="auto">
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
        </>
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
        <>
            <ListItemButton sx={{ pl: 4 }} onContextMenu={handleOpenContextualMenu} onClick={handleClick}>
                <ListItemText primary={<><b>{displayName || 'No name'}</b> <i>({recordId})</i></>} />
            </ListItemButton>
            <RecordContextualMenu anchorElement={anchorEl} entityName={entityName} recordId={recordId} open={!!anchorEl} onClose={handleCloseContextualMenu} />
        </>
    )
});


const relatedRecords = new RelatedRecordsButton();
export default relatedRecords;