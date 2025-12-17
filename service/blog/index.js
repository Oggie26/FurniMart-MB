import axiosClient from "../axiosClient";

export const getBlogs = () => {
    try {
        const res = axiosClient.get("/blogs");
        return res;
    } catch (error) {
        console.error("Error fetching blogs:", error);
    }
}

export const getBlogById = (id) => {
    try {
        const res = axiosClient.get(`/blogs/${id}`);
        return res;
    } catch (error) {
        console.error("Error fetching blog by id:", error);
    }
}