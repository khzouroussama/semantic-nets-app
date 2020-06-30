 import React, {useState} from 'react';
// In your App.js or index.js entry
import 'tailwindcss/dist/base.min.css'
import tw from 'twin.macro'
import VisNetwork from './components/graph'
import ToolBar from './components/toolbar'
import {Concept , Relation , SNetwork} from './logic/SementicNets'
import {DataSet} from "vis-network/standalone/esm/vis-network";

const Layout = tw.div`flex flex-row flex-wrap items-center  min-h-screen items-stretch ` ,
      Button = tw.button`mb-2 mx-2 bg-gray-400 hover:bg-gray-500 shadow-sm text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center`,
      Input = tw.input`border-2 border-indigo-300 rounded-full px-3 mx-4 mt-1 text-center outline-none p-4 h-4 mb-3`


const Concepts = [
   Concept`animal`,
   Concept`carnivor`,
   Concept`herbivor`,
   Concept`lion`,
   Concept`chien`,
   Concept`lapin`
 ]


 let SNET = SNetwork([
   Relation`${Concepts[1]} ${'is a'} ${Concepts[0]}` ,
   Relation`${Concepts[2]} ${'is a'} ${Concepts[0]}`,
   Relation`${Concepts[3]} ${'is a'} ${Concepts[1]}`,
   Relation`${Concepts[5]} ${'is a'} ${Concepts[2]}` ,
   Relation`${Concepts[4]} ${'is a'} ${Concepts[1]}` ,
   Relation`${Concepts[1]} ${'mange'} ${Concepts[5]}` ,
 ])

function App() {
  const [data , setData] = useState({nodes :new DataSet([]), edges : new DataSet()})

  const getData = () => {
    return {
      nodes : data.nodes.get() ,
      edges : data.edges.get()
    }
  }
  const handleChange = (data) => {
    setData(data)
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
        setData({nodes :new DataSet(results.nodes), edges : new DataSet(results.edges)})
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
            </div>

            {/* mark propagation */}
            <div tw="border-2 rounded-lg border-indigo-100 p-5 mx-4 shadow-inner bg-gray-100 mt-4">
              <div tw="text-lg mb-4 text-indigo-800">Mark propagation</div>
              <div>
                <Input placeholder="Put your question here"/>
              </div>
              <Button>
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
