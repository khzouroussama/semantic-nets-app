import React, {useState} from 'react';
// In your App.js or index.js entry
import 'tailwindcss/dist/base.min.css'
import tw from 'twin.macro'
import VisNetwork from './components/graph'
// import ToolBar from './components/toolbar'
import SNetwork from './logic/SementicNets'
import {DataSet} from "vis-network/standalone/esm/vis-network";
import KR_EXAMPLE from './exemples/KR.json'


const Layout = tw.div`flex flex-row flex-wrap items-center  min-h-screen items-stretch ` ,
      Card   = tw.div`border-2 rounded-lg border-indigo-100 py-2 px-4 mx-4 shadow bg-gray-100`,
      Button = tw.button`mb-2 mx-2 bg-gray-400 hover:bg-gray-500 shadow-sm text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center`,
      //Input  = tw.input`flex-1 border border-indigo-300 rounded-lg px-1 mx-1 mt-1 text-center outline-none p-1 h-10 mb-3 shadow-inner` ,
      Select = tw.select`flex-1 border-2 bg-gray-200  rounded-lg px-1 mx-1 mt-1 text-center outline-none p-1 h-10  mb-3 shadow-inner overflow-hidden`

function App() {
  const [data , setData] = useState({nodes :new DataSet(KR_EXAMPLE.nodes), edges : new DataSet(KR_EXAMPLE.edges)})
  const [readabledata , setReadableData] = useState({nodes :KR_EXAMPLE.nodes, edges : KR_EXAMPLE.edges})

  const [markprop , setMarkProp] = useState({val1 : KR_EXAMPLE.nodes[0].id , link : 'is a' , val2 :  KR_EXAMPLE.nodes[0].id })
  const [lastMarkers , setLastMarkers] = useState({m1 :[] , m2 :[] , solutions : []})

  const [saturationID , setSaturationID] = useState('everything')
  const [lastSaturations , setLastSaturation] = useState([])

  const sem_net = SNetwork(readabledata)
  const all_links = [...new Set(data.edges.get().map( v => v.label ))]

  console.log(KR_EXAMPLE)
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
        id => ({ id : id , color: null  , M1 :false})
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
        id => ({ id : id , color: {border : '#dc5468'} , borderWidth : 2  , M1 :true })
    ))
    // color M2 nodes
    data.nodes.update(m2.map(
        id => ({ id : id , color: {border : '#38ac5f'} ,  borderWidth : 2 ,  M2 : true } )
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

    data.nodes.update(result.map(res => data.nodes.get(res.from)).map(
        node => ({ id : node.id , color : { background : '#9ae6b4' } } )
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

                <span>Open</span>
              </Button>
              <Button onClick={()=> downloadJson() }>
                <span tw="fill-current w-5 h-5 mr-2">
                  <svg  viewBox="0 0 24 24">
                      <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                  </svg>
                </span>
                <span>Save</span>
              </Button>
              <div tw="text-sm my-1 text-indigo-400 font-mono p-1 border rounded-full bg-gray-200 shadow-inner mx-5"> <b>{readabledata.nodes.length}</b> Concepts - <b>{readabledata.edges.length}</b> relations</div>
              <div>
                <Button tw="p-2 py-1 mt-2"  onClick={()=> cleanGraph()}>
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


          {/*github*/}
          <div tw="px-5 mb-5 mx-auto">
            <a tw="flex text-gray-800 hover:text-indigo-600" href="https://github.com/khzouroussama/semantic-nets-app" target="_blank">
              <svg tw="h-6 w-6 fill-current " xmlns='http://www.w3.org/2000/svg'
                   viewBox='0 0 512 512'>
                <path
                    d='M256,32C132.3,32,32,134.9,32,261.7c0,101.5,64.2,187.5,153.2,217.9a17.56,17.56,0,0,0,3.8.4c8.3,0,11.5-6.1,11.5-11.4,0-5.5-.2-19.9-.3-39.1a102.4,102.4,0,0,1-22.6,2.7c-43.1,0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1,1.4-14.1h.1c22.5,2,34.3,23.8,34.3,23.8,11.2,19.6,26.2,25.1,39.6,25.1a63,63,0,0,0,25.6-6c2-14.8,7.8-24.9,14.2-30.7-49.7-5.8-102-25.5-102-113.5,0-25.1,8.7-45.6,23-61.6-2.3-5.8-10-29.2,2.2-60.8a18.64,18.64,0,0,1,5-.5c8.1,0,26.4,3.1,56.6,24.1a208.21,208.21,0,0,1,112.2,0c30.2-21,48.5-24.1,56.6-24.1a18.64,18.64,0,0,1,5,.5c12.2,31.6,4.5,55,2.2,60.8,14.3,16.1,23,36.6,23,61.6,0,88.2-52.4,107.6-102.3,113.3,8,7.1,15.2,21.1,15.2,42.5,0,30.7-.3,55.5-.3,63,0,5.4,3.1,11.5,11.4,11.5a19.35,19.35,0,0,0,4-.4C415.9,449.2,480,363.1,480,261.7,480,134.9,379.7,32,256,32Z'/>
              </svg>
              source
            </a>
          </div>

        </div>
      </Layout>
    </div>
  );
}

export default App;
