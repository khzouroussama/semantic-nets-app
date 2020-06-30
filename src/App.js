import React, {useState} from 'react';
// In your App.js or index.js entry
import 'tailwindcss/dist/base.min.css'
import tw from 'twin.macro'
import VisNetwork from './components/graph'
import ToolBar from './components/toolbar'
import SNetwork from './logic/SementicNets'
import {DataSet} from "vis-network/standalone/esm/vis-network";

const Layout = tw.div`flex flex-row flex-wrap items-center  min-h-screen items-stretch ` ,
      Button = tw.button`mb-2 mx-2 bg-gray-400 hover:bg-gray-500 shadow-sm text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center`,
      Input = tw.input`flex-1 border border-indigo-300 rounded-lg px-1 mx-1 mt-1 text-center outline-none p-1 h-10 mb-3 shadow-inner` ,
      Select = tw.select`flex-1 border-2 bg-gray-200  rounded-lg px-1 mx-1 mt-1 text-center outline-none p-1 h-10  mb-3 shadow-inner`

function App() {
  const [data , setData] = useState({nodes :new DataSet([]), edges : new DataSet()})
  const [readabledata , setReadableData] = useState({nodes :[], edges : []})
  const [markprop , setMarkProp] = useState({val1 : '' , link : '' , val2 : '' })

  const sem_net = SNetwork(readabledata)


  const getData = () => {
    return {
      nodes : data.nodes.get() ,
      edges : data.edges.get()
    }
  }


  const handleChange = (data_) => {
    setData(data_)
    setReadableData({nodes: data_.nodes.get() , edges: data_.edges.get()})
    setMarkProp({val1 : data_.nodes.get()[0].id , link : 'is a' , val2 : data_.nodes.get()[0].id })
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
    data.nodes.update(sem_net.mark(1,markprop.val1).map(
        id => ({ id : id , color: {border : 'red'} , M1 :true })
    ))

    data.nodes.update(sem_net.mark(2,markprop.val2).map(
        id => ({ id : id , color: {border : 'green'} , M2 : true } )
    ))
    console.log(sem_net.mark(2,markprop.val2))
  }

  const downloadJson = async () => {
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
    input.onchange = (e) => {
      const reader = new FileReader()
      new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result)
        reader.onerror = error => reject(error)
        reader.readAsText(e.target.files[0])
      }).then(content => {
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
        <div tw="w-full md:w-2/3">
          <VisNetwork data={data} handleChange={handleChange} />
        </div>
        <div tw="bg-gray-300 w-full md:w-1/3 shadow-2xl h-screen overflow-auto">
          <div tw="p-5">
            <div tw="text-3xl text-indigo-600 mt-5 mb-12 font-bold uppercase"> Semantic networks</div>

            {/* import save */}
            <div tw="border-2 rounded-lg border-indigo-100 p-5 mx-4 shadow-inner bg-gray-100">
              <div tw="text-lg mb-4 text-indigo-800">Import/Save knowledge base</div>
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
              <div tw="text-sm my-2 text-indigo-400 font-mono"> {readabledata.nodes.length} Concepts and {readabledata.edges.length} relations</div>
            </div>

            {/* mark propagation */}
            <div tw="border-2 rounded-lg border-indigo-100 p-5 mx-4 shadow-inner bg-gray-100 mt-4">
              <div tw="text-lg mb-4 text-indigo-800">Mark propagation</div>
                <div tw="flex flex-row">
                  <Select name="val1" tw="w-1/3" value={markprop.val1} onChange={handleMarkProp}>
                    {
                      readabledata.nodes.map(node =>
                          <option key={node.id} value={node.id}>{node.label}</option>
                      )
                    }
                  </Select>
                  <Input name="link" tw="w-1/3" placehoder="link" value={markprop.link} onChange={handleMarkProp}/>
                  <Select name="val2" tw="w-1/3" value={markprop.val2} onChange={handleMarkProp}>
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
            </div>

            {/* saturate network */}
            <div tw="border-2 rounded-lg border-indigo-100 p-5 mx-4 shadow-inner bg-gray-100 mt-4">
              <div tw="text-lg mb-4 text-indigo-800">Inheritance</div>
              <Button>
                <span>Saturate Network</span>
              </Button>
            </div>

          </div>
        </div>
      </Layout>
    </div>
  );
}

export default App;
