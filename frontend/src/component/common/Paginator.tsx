import React from "react";
import { Pagination } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { PaginationState, setCurrentPage } from "../../store/features/paginationSlice";

const Paginator = () => {
    const { itemsPerPage, totalItems, currentPage } = useSelector((state: { pagination: PaginationState }) => state.pagination);
    const dispatch = useDispatch();

    const paginate = React.useMemo(() => (pageNumber: number) => {        
        dispatch(setCurrentPage(pageNumber - 1));
    }, [dispatch]);

    const [items, setItems] = React.useState<React.ReactElement[]>([]);

    const totalPages = itemsPerPage && totalItems ? Math.ceil(totalItems / itemsPerPage) : 0;

    React.useEffect(() => {
        let tmpItems = [];
        for (let i = 1; i <= totalPages; i++) {
            tmpItems.push(
                <Pagination.Item key={i} active={i === currentPage + 1} onClick={() => paginate(i)}>
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