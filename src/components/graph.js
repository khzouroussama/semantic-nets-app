import React, {useEffect, useRef, useState} from 'react';
import { Network} from 'vis-network/standalone/esm/vis-network';
import 'vis-network/dist/dist/vis-network.css';
import tw, { styled } from 'twin.macro'

const Popup = styled.div`
        ${tw`absolute p-4 shadow-2xl rounded-lg m-4 z-50 border border-indigo-600 bg-gray-100`}
        ${({open}) => !open && tw`hidden`}
   `,
    Input = tw.textarea`border-2 border-indigo-300 rounded-lg px-3 mx-4 mt-1 text-center outline-none`,
    Button= tw.button`text-white bg-indigo-500 border-0 py-1 px-3 m-2 focus:outline-none hover:bg-indigo-600 rounded-lg`,
    Select = tw.select` border-2 border-indigo-300 bg-gray-200 rounded-lg px-1 mx-1 mt-1 text-center outline-none p-1 h-8  mb-3 shadow-inner`

const NodePopup = (props) => {
  const [label ,setLabel] = useState('')

  const getNewNode =(nodedata)=> {
    nodedata.label = label
    return nodedata
  }
  return (
      <Popup style={{left:'20%' , top:'30%'}} open={props.open}>
        <div>
          <div tw="text-lg text-blue-600 font-bold mb-3">Add Concept</div>
          <div>label</div>
          <Input onChange={(e) => setLabel(e.target.value)} />
          <div tw="mt-2">
            <Button onClick={() => props.handlSave( getNewNode(props.nodedata.data), props.nodedata.callback ,1)}>save</Button>
            <Button onClick={() => props.handlSave(props.nodedata.data , props.nodedata.callback ,1, false)}>cancel</Button>
          </div>
        </div>
      </Popup>
  )
}

const EdgePopup = (props) => {
  const [label ,setLabel] = useState('')
  const [type ,setType] = useState('All')

  const getNewEdge =(edgedata)=> {
    edgedata.label = label
    edgedata.arrows = type ==='All' ? {to:true} : {to: {enabled: true , type : 'vee'}}
    if (type ==='Some') edgedata.color = '#978dde'
    switch (label) {
      case `is a`:
        //edgedata.arrows = {to:true}
        break;
      case `is not` :
        edgedata.arrows = {to: {enabled: true , type : 'box'}}
        edgedata.color = '#ee3057'
        break;
      default:

    }
    return edgedata
  }
  return (
      <Popup style={{left:'20%' , top:'30%'}} open={props.open}>
        <div>
          <div tw="text-lg text-blue-600 font-bold mb-3">Add Relation</div>
          <div>type</div>
          <Select value={type} onChange={(e)=> setType(e.target.value)} >
            <option value="All">All</option>
            <option value="Some">Generally</option>
          </Select>
          <div>label</div>
          <Input onChange={(e) => setLabel(e.target.value)} />
          <div tw="mt-2">
            <Button onClick={() => props.handlSave( getNewEdge(props.edgedata.data), props.edgedata.callback,2)}>save</Button>
            <Button onClick={() => props.handlSave(props.edgedata.data , props.edgedata.callback ,2, false)}>cancel</Button>
          </div>
        </div>
      </Popup>
  )
}

const VisNetwork = (props) => {
  const [isOpenNode , setIsOpenNode] = useState(false)
  const [isOpenEdge , setIsOpenEdge] = useState(false)
  const [nodechanger , setNodeChanger] = useState({ data : {} , callback : () => null})
  const [edgechanger , setEdgeChanger] = useState({ data : {} , callback : () => null})

  // A reference to the div rendered by this component
  const domNode = useRef(null);

  // A reference to the vis network instance
  const network = useRef(null);


  const EditNode = (nodeData , callback) => {
    setIsOpenNode(true)
    setNodeChanger({data :nodeData , callback:  callback})
  }

  const EditEdge = (edgeData , callback) => {
    setIsOpenEdge(true)
    setEdgeChanger({data :edgeData , callback:  callback})
  }

  const handleSave = (data_ , callback , type , save = true) => {
    if(save) {
      if (type ===2)
        props.data.edges.add([data_])
      else props.data.nodes.add([data_])
      props.handleChange(props.data)
      callback(data_)
    }
    setIsOpenNode(false)
    setIsOpenEdge(false)
  }

  // TODO add delete / edit  to data
  const options = {
    autoResize: true,
    height: '100%',
    width: '100%',
    locale: 'en',
    nodes : {
      color: '#c3dafe' ,
      font: {
        color: '#3c366b'
      }
    },
    edges: {
      color: '#645bb3',
    },
    interaction : {
      navigationButtons :true ,
      keyboard : true
    },
    manipulation: {
      enabled: true,
      initiallyActive: true,
      addNode: (nodeData,callback) => {
        EditNode(nodeData ,callback)
      } ,
      addEdge:(edgeData,callback) => {
        EditEdge(edgeData ,callback)
      },
      //editNode :true ,
      editEdge: true,
      deleteNode: true,
      deleteEdge: true,
      controlNodeStyle:{
        // all node options are valid.
        // shape:'dot',
        // size:6,
        // color: {
        //   background: '#ff0000',
        //   border: '#3c3c3c',
        //   highlight: {
        //     background: '#07f968',
        //     border: '#3c3c3c'
        //   }
        // },
        // borderWidth: 2,
        // borderWidthSelected: 2

      }
    }
  }

  useEffect(
    () => {
      domNode.current.style['height'] = '100vh'; 
      network.current = new Network(domNode.current, props.data, options);
    },
      // eslint-disable-next-line
    [domNode , props.data]
  );

  // Styled Component

  return (
    <>
      <NodePopup open={isOpenNode} nodedata={nodechanger}  handlSave={handleSave} />
      <EdgePopup open={isOpenEdge} edgedata={edgechanger}  handlSave={handleSave}/>

      <div ref = { domNode }  />
    </>
  );
};

export default VisNetwork;