import React, { useState, useRef } from "react";
import { Paginator, type PaginatorPageChangeEvent } from "primereact/paginator";
import { DataTable, type DataTableSelectionMultipleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { FloatLabel } from "primereact/floatlabel";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

interface Art {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const App: React.FC = () => {

  const [arts, setarts] = useState<Art[]>([]);
  const [page_no, setpage_no] = useState<number>(1);
  const [rows, setrows] = useState(12);
  const [first, setFirst] = useState(0);
  const [value, setValue] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const ref = useRef<OverlayPanel | null>(null);
 
  async function api_caller() {
    try {
      const data = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page_no}`
      );
      if (!data.ok) {
        console.error("Connection established: error while fetching data", data.status);
        return;
      }
      const json_data = await data.json();
      const obj = json_data.data.map((art: Art) => ({
        id: art.id,
        title: art.title,
        place_of_origin: art.place_of_origin,
        artist_display: art.artist_display,
        inscriptions: art.inscriptions,
        date_start: art.date_start,
        date_end: art.date_end,
      }));
      setarts(obj);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  React.useEffect(() => {
    api_caller();
  }, [page_no]);

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFirst(event.first);
    setrows(event.rows);
    const currentPage = event.first / event.rows + 1;
    setpage_no(currentPage);
  };

  const handleSelection = (itemId: number) => {
    setSelectedItems(prevSelected => {
      if (prevSelected.includes(itemId)) {
        return prevSelected.filter(id => id !== itemId);
      } else {
        return [...prevSelected, itemId];
      }
    });
  };

  const dropdown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current) ref.current.toggle(e);
  };

  function rowSelection() {
    const quotient = Math.floor(value / 12);
    const remainder = value % 12;

    for (let index = 1; index <= quotient; index++) {
      async function fullPageCaller(page: number) {
        try {
          const res = await fetch(
            `https://api.artic.edu/api/v1/artworks?page=${page}`
          );
          if (!res.ok) {
            console.error(`Connection established: error while fetching page ${page}`, res.status);
            return;
          }
          const json_data = await res.json();
          const pageData = json_data.data;
          const ids = pageData.map((art: Art) => art.id);
          setSelectedItems((prev: number[]) => Array.from(new Set([...prev, ...ids])));
        } catch (error) {
          console.error(`Error fetching page ${page}:`, error);
        }
      }
      fullPageCaller(index);
    }

    if (remainder !== 0) {
      async function remainderCaller(extraPage: number) {
        try {
          const res = await fetch(
            `https://api.artic.edu/api/v1/artworks?page=${extraPage}`
          );
          if (!res.ok) {
            console.error(`Connection established: error while fetching page ${extraPage}`, res.status);
            return;
          }
          const json_data = await res.json();
          const limited = json_data.data.slice(0, remainder);
          const ids = limited.map((art: Art) => art.id);
          setSelectedItems((prev: number[]) => Array.from(new Set([...prev, ...ids])));
        } catch (error) {
          console.error(`Error fetching page ${extraPage}:`, error);
        } finally {
          ref.current?.hide();
        }
      }

      remainderCaller(quotient + 1);
    } else {
      ref.current?.hide();
    }
  }

  return (
    <div>
      {arts.length === 0 ? (
        <div>
          <span>Loading...</span>
        </div>
      ) : (
        <>
          <DataTable
            value={arts}
            dataKey="id"
            rows={12}
            selection={arts.filter(art => selectedItems.includes(art.id))}
            onRowClick={e => handleSelection(e.data.id)}
            selectionMode={"multiple"}
          >
            <Column field="id" selectionMode="multiple"
              header={
                <div onClick={dropdown}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    marginRight: "5px",
                    padding: "2px",
                  }}>
                  <i className="pi pi-chevron-down" />
                </div>
              }
            />
            <Column field="title" header="Title" />
            <Column field="place_of_origin" header="Origin" />
            <Column field="artist_display" header="Artist" />
            <Column field="inscriptions" header="Inscriptions" />
            <Column field="date_start" header="Start Date" />
            <Column field="date_end" header="End Date" />
          </DataTable>

          <OverlayPanel ref={ref}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <FloatLabel>
                <InputNumber
                  id="number-input"
                  value={value}
                  onValueChange={(e) => setValue(e.value as number)}
                />
                <label htmlFor="number-input">Select Rows</label>
              </FloatLabel>
              <Button onClick={rowSelection} style={{ marginTop: "10px" }}>
                Submit
              </Button>
            </div>
          </OverlayPanel>

          <Paginator first={first} rows={rows} totalRecords={120} onPageChange={onPageChange} />
        </>
      )}
    </div>
  );
};

export default App;