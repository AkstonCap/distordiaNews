import { CatalogueTable } from "./styles";


export const renderNewsTable = (data) => {
        if (!Array.isArray(data)) {
          return null;
        }
        return data.map((item, index) => (
          <CatalogueTable
          key={index}
          onClick={() => viewAsset(item.address)}
          >
          <td>{ item.address }</td>
          <td>{ item.text }</td>
          </CatalogueTable>
        ));
      };