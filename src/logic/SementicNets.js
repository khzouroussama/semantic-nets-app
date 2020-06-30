
let count = 0 ;

export const Concept = (label) => {
    return {
        id : count++ ,
        label : label[0] ,
        M : [false , false] ,
        setM(num){ 
            this.M[num-1] = true
        },
        getM(num) {
            return this.M[num-1]
        }
    }
}

export const Relation = (strings = '' , concept1 , link , concept2) => {
    return {
        start : concept1.id ,
        end : concept2.id ,
        link : link ,
        show() {
            return `${this.start.label}(${this.start.M}) -${link}-> ${concept2.label}(${this.end.M})`
        } 
    }
}

export const SNetwork = (relations) => relations



