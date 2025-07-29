import React, { useState } from 'react'
import { Paginator } from 'primereact/paginator';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const App: React.FC = () => {

  const [arts, setarts] = useState([])
  const [page_no, setpage_no] = useState<number>(1)
  const [rows, setrows] = useState(12)
  const [first, setFirst] = useState(0);

  async function api_caller() {
    try {
      const data = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page_no}`);
      if (!data.ok) {
        console.log("connection estabilished: error while fecting");
      }
      else {
        const json_data = await data.json();
        setarts(json_data.data)
      }
    } catch (error) {
      console.log(error);

    }
  }

  React.useEffect(() => {
    api_caller();
  }, [page_no])

  // const extracter = (value) => {
  //   arts.map((art) => {
  //     return (
  //       <h3>{art.value}</h3>
  //     )
  //   })
  // }

  const onPageChange = (event) => {
    setFirst(event.first);
    setrows(event.rows);
    setpage_no((prev) => (prev + 1))
  };

  const checkBox = (id) => {
    return (
      <input type="checkbox" name="" />
    )
  }

  return (
    <div>
      <DataTable value={arts} dataKey="id" rows={12}>
        <Column field="id" body={checkBox} header="Select" />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
      <Paginator first={first} rows={rows} totalRecords={120} onPageChange={onPageChange} />
    </div>
  )
}

export default App