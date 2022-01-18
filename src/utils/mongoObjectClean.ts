import * as _ from 'lodash';
export default function removeFields(obj: Object, fields: Array<string>): void{
    _.forEach(fields, (field: string)=>{
        if(_.has(Object, field)){
            _.unset(Object, field)
        }
    })
}
