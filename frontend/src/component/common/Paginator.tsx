import React from "react";
import { Pagination } from "react-bootstrap";

export interface PaginatorProps {
    itemsPerPage?: number;
    totalItems?: number;
    currentPage?: number;
    paginate?: (page: number) => void;
};

const Paginator = (p: PaginatorProps) => {
    const { itemsPerPage, totalItems, currentPage, paginate } = p;

    const [items, setItems] = React.useState<React.ReactElement[]>([]);

    const totalPages = itemsPerPage && totalItems ? Math.ceil(totalItems / itemsPerPage) : 0;

    React.useEffect(() => {
        let tmpItems = [];
        for(let i = 1; i <= totalPages; i++) {
            tmpItems.push(
                <Pagination.Item key={i} active={i === currentPage} onClick={() => paginate && paginate(i)}>
                    {i}
                </Pagination.Item>
            );
        }
        setItems(tmpItems);    
    }, [totalPages, paginate, currentPage]);

    return (
        <div className="d-flex justify-content-center me-5">
            <Pagination>{items}</Pagination>
        </div>
    );
};

export default Paginator;