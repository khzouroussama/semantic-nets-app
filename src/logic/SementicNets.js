const SNetwork = ({nodes , edges}) => {

    return {
        mark(id) {
            return edges.filter(edge => edge.to === id && edge.label === 'is a')
                .map(edge => this.mark(edge.from).concat( edge.from )).flat().concat(id)
        },
        saturate(id , link) {
            const all_not = edges.filter(edge => edge.label === link && edge.edge_type === 'Not').map(
                edge => (edge.from +""+edge.to)
            )
            console.log('EXEPTIONS ' , link , all_not)
            return this.saturateForId(id , id,link,all_not)
        },
        saturateForId(id_original ,id , link , exceptions ){
            return edges.filter(edge => edge.from === id && (edge.label === link || edge.label === 'is a'))
                .map(edge => this.saturateForId(id_original , edge.to , link , exceptions ).concat(
                    (edge.label === link) && !exceptions.includes(id_original+""+edge.to) ? { to : edge.to , type : edge.edge_type } : [])
                ).flat()
        }
    }
}

export default SNetwork


