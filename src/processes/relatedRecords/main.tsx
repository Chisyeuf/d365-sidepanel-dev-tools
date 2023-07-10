
import { Chip, Collapse, Divider, List, ListItemButton, ListItemIcon, ListItemText, Stack, createTheme } from '@mui/material';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import ShareIcon from '@mui/icons-material/Share';

import { RetrieveRelationShipManyToMany } from '../../utils/hooks/XrmApi/RetrieveRelationShipManyToMany';
import { RetrieveRelationShipManyToOne } from '../../utils/hooks/XrmApi/RetrieveRelationShipManyToOne';
import { RetrieveRelationShipOneToMany } from '../../utils/hooks/XrmApi/RetrieveRelationShipOneToMany';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { RelationShipMetadata, RelationShipMetadataManyToMany, RelationShipMetadataManyToOne, RelationShipMetadataOneToMany, RelationshipType } from '../../utils/types/requestsType';
import { RetrieveRelatedRecords } from '../../utils/hooks/XrmApi/RetrieveRelatedRecords';
import { formatId } from '../../utils/global/common';
import { ThemeProvider } from '@emotion/react';
import { LookupValue } from '../../utils/types/LookupValue';
import { RetrievePrimaryIdAttribute } from '../../utils/hooks/XrmApi/RetrievePrimaryIdAttribute';
import { RetrievePrimaryNameAttribute } from '../../utils/hooks/XrmApi/RetrievePrimaryNameAttribute';
import { useHover } from 'usehooks-ts';
import { unset } from 'lodash';
import { useCurrentRecord } from '../../utils/hooks/use/useCurrentRecord';
import RecordSearchBar from '../../utils/components/RecordSearchBar';

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
            350
        );
        this.process = RelatedRecordsProcess;
    }
}

const RelatedRecordsProcess = forwardRef<ProcessRef, ProcessProps>(
    function RelatiedRecordsProcess(props: ProcessProps, ref) {

        const { entityName: currentEntityName, recordId: currentRecordId, isEntityRecord } = useCurrentRecord();

        const [entityName, setEntityName] = useState<string>(currentEntityName ?? '');
        const [recordId, setRecordId] = useState<string[]>([currentRecordId ?? '']);

        const resetRecord = useCallback(() => {
            setEntityName(currentEntityName ?? '');
            setRecordId([currentRecordId ?? '']);
        }, [currentEntityName, currentRecordId, setEntityName, setRecordId]);


        // const [entityName, setEntityName] = useState<string>(Xrm.Page.data?.entity.getEntityName())
        // const [recordId, setRecordsIds] = useState<string>(formatId(Xrm.Page.data?.entity.getId().toLowerCase()))

        const [manyToMany, isManyToManyFetching] = RetrieveRelationShipManyToMany(entityName);
        const [oneToMany, isOneToManyFetching] = RetrieveRelationShipOneToMany(entityName);
        const [manyToOne, isManyToOneFetching] = RetrieveRelationShipManyToOne(entityName);


        return (
            <ThemeProvider theme={theme}>
                <Stack spacing={0.5} width='calc(100% - 10px)' padding='10px' alignItems='center' overflow='scroll'>
                    <RecordSearchBar entityName={entityName} recordIds={recordId} setEntityName={setEntityName} setRecordIds={setRecordId} reset={resetRecord} theme={theme} />

                    {!isManyToManyFetching && <RelationShipList title='Many To Many' relationShipMetadata={manyToMany} key={'manytomany'} entityName={entityName} recordId={recordId.at(0) ?? ''} />}

                    {!isOneToManyFetching && <RelationShipList title='One To Many' relationShipMetadata={oneToMany} key={'oneToMany'} entityName={entityName} recordId={recordId.at(0) ?? ''} />}

                    {!isManyToOneFetching && <RelationShipList title='Many To One' relationShipMetadata={manyToOne} key={'manyToOne'} entityName={entityName} recordId={recordId.at(0) ?? ''} />}
                </Stack>
            </ThemeProvider>
        );
    }
);

interface RelationShipListProps<T extends RelationShipMetadata> {
    title: string,
    relationShipMetadata: T[],
    entityName: string,
    recordId: string
}
function RelationShipList<T extends RelationShipMetadata>(props: RelationShipListProps<T>) {

    const { relationShipMetadata, title, entityName, recordId } = props;

    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(prev => !prev);
    };

    const numberOfRelationshipChip = useRef(null);
    const numberOfRelationshipChipHovered = useHover(numberOfRelationshipChip);

    const numberOfRelationshipBig = useMemo(() => {
        if (!relatedRecords) return '?';
        return relationShipMetadata.length;
    }, [relatedRecords]);
    const numberOfRelationshipSmall = useMemo(() => {
        if (!relatedRecords) return '?';
        const max = 999;
        return relationShipMetadata.length > max ? max + '+' : relationShipMetadata.length;
    }, [relatedRecords]);

    // const relationShipFetchInfo = useMemo(() => relationShipMetadata.map((r: T) => {
    //     switch (r.RelationshipType) {
    //         case RelationshipType.ManyToManyRelationship:
    //             if (r.Entity1LogicalName === entityName) {
    //                 return {
    //                     relationshipSchemaName: r.SchemaName,
    //                     entityName: r.Entity2LogicalName,
    //                     navigationPropertyName: r.Entity1NavigationPropertyName
    //                 };
    //             }
    //             else {
    //                 return {
    //                     relationshipSchemaName: r.SchemaName,
    //                     entityName: r.Entity1LogicalName,
    //                     navigationPropertyName: r.Entity2NavigationPropertyName
    //                 };
    //             }
    //         case RelationshipType.OneToManyRelationship:
    //             return {
    //                 relationshipSchemaName: r.SchemaName,
    //                 entityName: r.ReferencingEntity,
    //                 navigationPropertyName: r.ReferencedEntityNavigationPropertyName
    //             };
    //         case RelationshipType.ManyToOneRelationship:
    //             return {
    //                 relationshipSchemaName: r.SchemaName,
    //                 entityName: r.ReferencedEntity,
    //                 navigationPropertyName: r.ReferencingEntityNavigationPropertyName
    //             };
    //     }
    // }), [relationShipMetadata]);
    // const [relatedRecords, isFetching] = RetrieveRelatedRecords(entityName, recordId, relationShipFetchInfo);


    // const relationShipMetadataSorted = useMemo(() => {
    //     return relationShipMetadata.sort((r1, r2) => relatedRecords[r1.SchemaName]?.length ?? -1 - relatedRecords[r2.SchemaName]?.length ?? -1)
    // }, [relationShipMetadata, relatedRecords]);


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
                        relationShipMetadata.map(relationShip => {
                            return <RelationShipItem key={relationShip.SchemaName} relationShipMetadata={relationShip} entityName={entityName} recordId={recordId} />
                        })
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
}
function RelationShipItem(props: RelationShipItemProps) {
    const { relationShipMetadata, entityName, recordId } = props;

    const [open, setOpen] = useState(false);


    const relationShipFetchInfo = useMemo(() => {
        switch (relationShipMetadata.RelationshipType) {
            case RelationshipType.ManyToManyRelationship:
                if (relationShipMetadata.Entity1LogicalName === entityName) {
                    return {
                        relationshipSchemaName: relationShipMetadata.SchemaName,
                        entityName: relationShipMetadata.Entity2LogicalName,
                        navigationPropertyName: relationShipMetadata.Entity1NavigationPropertyName
                    };
                }
                else {
                    return {
                        relationshipSchemaName: relationShipMetadata.SchemaName,
                        entityName: relationShipMetadata.Entity1LogicalName,
                        navigationPropertyName: relationShipMetadata.Entity2NavigationPropertyName
                    };
                }
            case RelationshipType.OneToManyRelationship:
                return {
                    relationshipSchemaName: relationShipMetadata.SchemaName,
                    entityName: relationShipMetadata.ReferencingEntity,
                    navigationPropertyName: relationShipMetadata.ReferencedEntityNavigationPropertyName
                };
            case RelationshipType.ManyToOneRelationship:
                return {
                    relationshipSchemaName: relationShipMetadata.SchemaName,
                    entityName: relationShipMetadata.ReferencedEntity,
                    navigationPropertyName: relationShipMetadata.ReferencingEntityNavigationPropertyName
                };
        }
    }, [relationShipMetadata]);
    const [relatedRecordsDict, isFetching] = RetrieveRelatedRecords(entityName, recordId, [relationShipFetchInfo]);
    const relatedRecords = useMemo(() => relatedRecordsDict[relationShipMetadata.SchemaName], [relatedRecordsDict]);


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

    const handleClick = () => {
        setOpen(prev => !prev);
    };

    return (
        <>
            <ListItemButton onClick={handleClick}>
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
            <Collapse in={open} timeout="auto" unmountOnExit>
                {
                    <List component="div" disablePadding>
                        {
                            relatedRecords?.map(relatedRecord => {
                                return (
                                    <RelatedRecordsItem displayName={relatedRecord.name} entityName={relatedRecord.entityType} recordId={relatedRecord.id} key={relatedRecord.id} />
                                );
                            })
                        }
                    </List>
                }
            </Collapse>
        </>
    );
}

interface RelatedRecordsItemProps {
    entityName: string,
    recordId: string,
    displayName?: string,
}
function RelatedRecordsItem(props: RelatedRecordsItemProps) {
    const { displayName, entityName, recordId } = props

    return (
        <ListItemButton sx={{ pl: 4 }}>
            <ListItemText primary={displayName || `(${recordId})`} />
        </ListItemButton>
    )
}


const relatedRecords = new RelatedRecordsButton();
export default relatedRecords;