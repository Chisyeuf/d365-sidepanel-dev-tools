import { FormContext } from "../types/FormContext";
import { LookupValue } from "../types/LookupValue";
import { AttributeMetadata, MSType, StringAttributeFormat } from "../types/requestsType";

export const getRandomValue = async (formContext: FormContext , attribute: Xrm.Attributes.Attribute, metadata: AttributeMetadata) => {
    switch (metadata.MStype) {
        case MSType.Lookup:
            return getRandomLookup(metadata.Parameters.Target);
        case MSType.String:
        case MSType.Memo:
            return getRandomString(metadata.Parameters.MaxLength, metadata.Parameters.Format);
        case MSType.Decimal:
        case MSType.Double:
        case MSType.Money:
        case MSType.Integer:
        case MSType.BigInt:
            return getRandomNumber(metadata.Parameters.MinValue, metadata.Parameters.MaxValue, metadata.Parameters.Precision);
        case MSType.DateTime:
            return getRandomDate(metadata.Parameters.Format);
        case MSType.Boolean:
        case MSType.Status:
        case MSType.State:
        case MSType.Picklist:
        case MSType.MultiSelectPicklist:
            if (!formContext?.data?.entity) return null;
            const options = Object.values(
                (await Xrm.Utility.getEntityMetadata(
                    formContext.data?.entity?.getEntityName(),
                    [attribute.getName()])).Attributes.get(0)?.OptionSet
            ).map((o: any) => o.value);
            return getRandomPickList(options);
        case MSType.Uniqueidentifier:
        case MSType.Null:
            return null;
    }
}

function getRandomNumber(minValue: number, maxValue: number, precision: number = 0) {
    const number = minValue + Math.random() * (maxValue - minValue);
    return Number(number.toFixed(precision));
}

function getRandomStringGenerator(maxLength: number, allowSpaces = false, forceLowerCase = false) {
    const length = maxLength;

    const characters = 'bcdfghjklmnpqrstvwxyz';
    const vowels = "aeiou";
    const charactersLength = characters.length;
    const vowelsLength = vowels.length;

    let result = '';
    let counter = 0;
    let nextCharIsVowel = false;
    while (counter < length) {

        if (allowSpaces && Math.random() < 0.1 && counter < length - 3 && result.at(-1) !== ' ') {
            result += ' ';
        }
        else {
            nextCharIsVowel = characters.includes(result.at(-1) ?? ' ') || (result.at(-1) === ' ' && Math.random() < 0.4);
            if (nextCharIsVowel)
                result += vowels.charAt(Math.floor(Math.random() * vowelsLength));
            else
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        counter += 1;
    }
    if (!forceLowerCase) {
        const arr = result.split(' ');
        for (var i = 0; i < arr.length; i++) {
            arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1).toLowerCase();
        }
        return arr.join(' ');
    }
    else {
        return result;
    }
}

function getRandomString(maxLength: number, format: string) {
    switch (format) {
        case StringAttributeFormat.Email:
            return `${getRandomStringGenerator(Math.min((maxLength / 3), 15), false, true)}@${getRandomStringGenerator(Math.min((maxLength / 3), 10), false, true)}.${getRandomStringGenerator(getRandomNumber(2, 3), false, true)}`;
        case StringAttributeFormat.Phone:
        case StringAttributeFormat.Text:
        case StringAttributeFormat.TextArea:
        case StringAttributeFormat.TickerSymbol:
            return getRandomStringGenerator(Math.min((maxLength / 3), 50), true);
        case StringAttributeFormat.URL:
            return `www.${getRandomStringGenerator(Math.min((maxLength / 3), 20))}.${getRandomStringGenerator(3)}`;
    }
    return '';
}

function getRandomPickList(options: number[]) {
    const randomIndex = getRandomNumber(0, options.length - 1);
    return options.at(randomIndex);
}

async function getRandomLookup(target: string): Promise<LookupValue[] | null> {
    const randomIndex = getRandomNumber(1, 5);
    const primaryIdAttribute = (await Xrm.Utility.getEntityMetadata(target)).PrimaryIdAttribute;
    const primaryNameAttribute = (await Xrm.Utility.getEntityMetadata(target)).PrimaryNameAttribute;
    const record = (await Xrm.WebApi.online.retrieveMultipleRecords(target, `?$select=${primaryIdAttribute},${primaryNameAttribute}`, randomIndex)).entities.at(randomIndex - 1);
    if (!record) return null;
    return [{
        id: record[primaryIdAttribute],
        name: record[primaryNameAttribute],
        entityType: target,
    }];
}

function getRandomDate(format: string) {
    const start = new Date(1753, 1, 1);
    const end = new Date(9999, 12, 31);
    return new Date(getRandomNumber(start.getTime(), end.getTime()));
}
