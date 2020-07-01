const SNetwork = ({nodes , edges}) => {

    return {
        mark(id) {
            return edges.filter(edge => edge.to === id && edge.label === 'is a')
                .map(edge => this.mark(edge.from).concat( edge.from )).flat().concat(id)
        },
        saturate(id , link) {
            return edges.filter(edge => edge.from === id && (edge.label === link || edge.label === 'is a'))
                .map(edge => this.saturate(edge.to , link).concat( edge.label === link ? edge.to : [])).flat()
        }
    }
}

export default SNetwork


