import React, { useState, useRef } from 'react'
import { Paginator } from 'primereact/paginator';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Dropdown } from 'primereact/dropdown';


const App: React.FC = () => {

  const [arts, setarts] = useState([])
  const [page_no, setpage_no] = useState<number>(1)
  const [rows, setrows] = useState(12)
  const [first, setFirst] = useState(0);
  const [SelectedArts, setSelectedArts] = useState([]);
  const ref = useRef(null);

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


  const onPageChange = (event) => {
    setFirst(event.first);
    setrows(event.rows);
    const currentPage = event.first / event.rows + 1;
    setpage_no(currentPage);
  };

  const selection = (e) => {
    setSelectedArts(e.value);
  }

  const dropdown = (e) => {
    ref.current.toggle(e)
    return (
      <OverlayPanel ref={ref}>
        <input type="number" name="" id="" />
      </OverlayPanel>
    )
  }

  return (
    <div>
      {arts.length === 0 ? (
        <div>
          <span>Loading...</span>
        </div>
      ) : (
        <>
          <DataTable value={arts} dataKey="id" rows={12} selection={SelectedArts}
            onSelectionChange={selection}>
            <Column field="id" selectionMode="multiple" header={
              <div onClick={dropdown} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <i className="pi pi-chevron-down" />
              </div>
            } />
            <Column field="title" header="Title" />
            <Column field="place_of_origin" header="Origin" />
            <Column field="artist_display" header="Artist" />
            <Column field="inscriptions" header="Inscriptions" />
            <Column field="date_start" header="Start Date" />
            <Column field="date_end" header="End Date" />
          </DataTable>
          <Paginator
            first={first}
            rows={rows}
            totalRecords={120}
            onPageChange={onPageChange}
          />
        </>
      )
      }
    </div >
  )
}

export default App