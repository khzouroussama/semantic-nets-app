import React, {useState} from 'react';
// In your App.js or index.js entry
import 'tailwindcss/dist/base.min.css'
import tw from 'twin.macro'
import VisNetwork from './components/graph'
// import ToolBar from './components/toolbar'
import SNetwork from './logic/SementicNets'
import {DataSet} from "vis-network/standalone/esm/vis-network";

const Layout = tw.div`flex flex-row flex-wrap items-center  min-h-screen items-stretch ` ,
      Card   = tw.div`border-2 rounded-lg border-indigo-100 py-2 px-4 mx-4 shadow bg-gray-100`,
      Button = tw.button`mb-2 mx-2 bg-gray-400 hover:bg-gray-500 shadow-sm text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center`,
      //Input  = tw.input`flex-1 border border-indigo-300 rounded-lg px-1 mx-1 mt-1 text-center outline-none p-1 h-10 mb-3 shadow-inner` ,
      Select = tw.select`flex-1 border-2 bg-gray-200  rounded-lg px-1 mx-1 mt-1 text-center outline-none p-1 h-10  mb-3 shadow-inner overflow-hidden`

function App() {
  const [data , setData] = useState({nodes :new DataSet([]), edges : new DataSet()})
  const [readabledata , setReadableData] = useState({nodes :[], edges : []})

  const [markprop , setMarkProp] = useState({val1 : '' , link : '' , val2 : '' })
  const [lastMarkers , setLastMarkers] = useState({m1 :[] , m2 :[] , solutions : []})

  const [saturationID , setSaturationID] = useState('everything')
  const [lastSaturations , setLastSaturation] = useState([])

  const sem_net = SNetwork(readabledata)
  const all_links = [...new Set(data.edges.get().map( v => v.label ))]

  // const getData = () => {
  //   return {
  //     nodes : data.nodes.get() ,
  //     edges : data.edges.get()
  //   }
  // }


  const handleChange = (data_) => {
    setData(data_)
    setReadableData({nodes: data_.nodes.get() , edges: data_.edges.get()})
    setMarkProp({val1 : data_.nodes.get()[0].id , link : 'is a' , val2 : data_.nodes.get()[0].id })
  }

  const cleanGraph = () => {
    // Clean Markers
    data.nodes.update(lastMarkers.m1.map(
        id => ({ id : id , color: null  , M1 :false })
    ))
    data.nodes.update(lastMarkers.m2.map(
        id => ({ id : id , color: null  , M2 : false } )
    ))
    data.edges.update(lastMarkers.solutions.map(
        edge => ({id : edge.id , color : null , width : null })
    ))
    // Clean inference edges
    data.edges.remove(lastSaturations)

  }

  const handleMarkProp = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    setMarkProp({
      ...markprop ,
      [name] : value
    })
  }

  const runMarkProp = () => {
    cleanGraph()
    // mark M1 / M2
    const [m1 , m2 ] = [sem_net.mark(markprop.val1) , sem_net.mark(markprop.val2)]
    // ======================= Visualize coloration
    // color M1 nodes
    data.nodes.update(m1.map(
        id => ({ id : id , color: {border : '#dc5468'} , borderWidth : 2 , M1 :true })
    ))
    // color M2 nodes
    data.nodes.update(m2.map(
        id => ({ id : id , color: {border : '#38ac5f'} ,  borderWidth : 2 , M2 : true } )
    ))

    // find solutions
    const result = data.edges.get().filter(
        edge => ((data.nodes.get(edge.from).M1 && data.nodes.get(edge.to).M2) || (data.nodes.get(edge.from).M2 && data.nodes.get(edge.to).M1)) && edge.label === markprop.link
    )
    //=========================== visualize Solutions
    // Color solution edges
    data.edges.update(result.map(
        edge => ({ id : edge.id , color: '#6fb66f' , width : 3} )
    ))

    setLastMarkers({m1 : m1, m2 : m2 , solutions : result} )

    alert(
        `Answers  :
${
result.length ?
    result.map(edge => data.nodes.get(edge.from).label.replace(/\n/g, '')).join('\n') : 'No answers'
}
        `

    )
  }

  const handleSaturation = (e) => {
    const value = e.target.value;
    setSaturationID(value)
  }

  const runSaturate = () => {
    cleanGraph()
    let result =[] ;
    let new_edges =[] ;
    console.log(all_links)

    const exceptions = readabledata.edges.filter(v => v.label === 'is not')

    if (saturationID === 'everything'){
      // console.log(saturationID)
      all_links.forEach(link => {
        data.nodes.forEach( node => {
          result = sem_net.saturate(node.id , link )
          // Skip Exceptions
          result = result.filter(n => !(exceptions.map(ex=> ex.from).includes(node.id) && exceptions.map(ex=> ex.to).includes(n)) )

          new_edges = new_edges.concat(
              data.edges.add(
                  result.map(val => ({from : node.id , to : val , label : link, arrows : {to :true} , dashes : true , color : 'lightgray'}))
              )
          )
        })
      }
      )
    } else {
      all_links.forEach(
          link  => {
            result = sem_net.saturate(saturationID , link)
            result = result.filter(n => !(exceptions.map(ex=> ex.from).includes(saturationID) && exceptions.map(ex=> ex.to).includes(n)) )
            new_edges = new_edges.concat(data.edges.add(
                result.map(val => ({from : saturationID , to : val , label : link, arrows : {to :true} , dashes : true , color : 'lightgray'} ))
            ))
          })
    }
    setLastSaturation(new_edges)
  }


  const downloadJson = async () => {
    cleanGraph()
    const fileName = "file";
    const json = JSON.stringify({ nodes: data.nodes.get() , edges : data.edges.get()} );
    const blob = new Blob([json],{type:'application/json'});
    const href = await URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const uploadJson = () => {
    const input = document.createElement('input');
    input.type = "file";
    input.accept = "application/json"
    input.onchange = (e) => {
      const reader = new FileReader()
      new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result)
        reader.onerror = error => reject(error)
        reader.readAsText(e.target.files[0])
      }).then(content => {
        cleanGraph()
        const results = JSON.parse(content)
        handleChange({nodes :new DataSet(results.nodes), edges : new DataSet(results.edges)})
      }).catch(error => console.log(error))
    }
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }


  return (
    <div tw="text-center min-h-screen ">
      <Layout>
        {/* Toolbar */}
        {/*<ToolBar/>*/}
        <div tw="w-full md:w-2/3 sm:h-64">
          <VisNetwork data={data} handleChange={handleChange} />
        </div>
        <div tw="flex flex-col bg-gray-300 w-full md:w-1/3 shadow-2xl h-screen overflow-auto">
          <div tw="text-2xl text-indigo-600 mt-10 font-bold uppercase"> Semantic networks</div>
          <div tw="px-5 py-2 my-auto ">
            {/* import save */}
            <Card >
              <div tw="my-2 text-indigo-600 font-bold">Knowledge Bases</div>
              <Button onClick={()=> uploadJson()}>
                <span tw="fill-current w-5 h-5 mr-2">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
                  </svg>
                </span>

                <span>Import</span>
              </Button>
              <Button onClick={()=> downloadJson() }>
                <span tw="fill-current w-5 h-5 mr-2">
                  <svg  viewBox="0 0 24 24">
                      <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                  </svg>
                </span>
                <span>Save</span>
              </Button>
              <div tw="text-sm my-1 text-indigo-400 font-mono"> <b>{readabledata.nodes.length}</b> Concepts - <b>{readabledata.edges.length}</b> relations</div>
              <div>
                <Button tw="p-2 py-1"  onClick={()=> cleanGraph()}>
                  <span tw="fill-current w-5 h-5 mr-2">
                    <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M2 12C2 9.21 3.64 6.8 6 5.68V3.5C2.5 4.76 0 8.09 0 12S2.5 19.24 6 20.5V18.32C3.64 17.2 2 14.79 2 12M15 3C10.04 3 6 7.04 6 12S10.04 21 15 21 24 16.96 24 12 19.96 3 15 3M20 15.59L18.59 17L15 13.41L11.41 17L10 15.59L13.59 12L10 8.41L11.41 7L15 10.59L18.59 7L20 8.41L16.41 12L20 15.59Z" />
                    </svg>
                  </span>
                  <span>Clean</span>
                </Button>
              </div>
            </Card>
            <Card tw="p-3 mt-3 bg-gray-200 shadow-inner">
              <div tw="text-lg text-indigo-600 my-2 font-bold uppercase"> Algorithms</div>
              {/* mark propagation */}
              <Card>
                <div tw="my-2 text-indigo-600 font-bold">Mark propagation</div>
                  <div tw="flex flex-wrap">
                    <Select name="val1" tw="w-full lg:w-1/3" value={markprop.val1} onChange={handleMarkProp}>
                      {
                        readabledata.nodes.map(node =>
                            <option key={node.id} value={node.id}>{node.label}</option>
                        )
                      }
                    </Select>
                    <Select name="link" tw="w-full lg:w-1/3 border-indigo-200 text-indigo-600 font-bold items-center" value={markprop.link} onChange={handleMarkProp}>
                      {
                        all_links.map(link =>
                            <option key={link} value={link}>{link}</option>
                        )
                      }
                    </Select>
                    <Select name="val2" tw="w-full lg:w-1/3" value={markprop.val2} onChange={handleMarkProp}>
                      {
                        readabledata.nodes.map(node =>
                            <option key={node.id} value={node.id}>{node.label}</option>
                        )
                      }
                    </Select>
                  </div>
                  <Button onClick={() => runMarkProp()}>
                    <span>Find Solutions</span>
                  </Button>
              </Card>

              {/* saturate network */}
              <Card tw="mt-4">
                <div tw="my-2 text-indigo-600 font-bold">Inheritance</div>
                <div tw="flex flex-row">
                  <Select name="SaturationID" tw="w-1/3 lg:mx-12" value={saturationID}  onChange={handleSaturation}>
                    <option tw="bg-green-400 font-bold" value="everything">Everthing</option>
                    {
                      readabledata.nodes.map(node =>
                          <option key={node.id} value={node.id}>{node.label}</option>
                      )
                    }
                  </Select>
                </div>
                <Button onClick={()=> runSaturate()}>
                  <span>Saturate Network</span>
                </Button>
              </Card>
            </Card>
          </div>
        </div>
      </Layout>
    </div>
  );
}

export default App;
