import { Route, Routes } from "react-router-dom";
import { SVCIndex } from "../pages/SVCIndex/SVCIndex";

export const MyRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<SVCIndex />} />
        </Routes>
    );
};