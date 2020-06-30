const SNetwork = ({nodes , edges}) => {

    return {
        mark(num,id) {
            return edges.filter(edge => edge.to === id && edge.label === 'is a')
                .map(edge => this.mark(num, edge.from).concat( edge.from )).flat().concat(id)
        }
    }
}

export default SNetwork


