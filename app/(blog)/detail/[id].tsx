"use client"

import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import {
    ActivityIndicator,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { getBlogById } from "../../../service/blog"

const { width } = Dimensions.get("window")

export default function BlogDetail() {
    const { id } = useLocalSearchParams()
    const router = useRouter()
    const [blog, setBlog] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBlogDetail = async () => {
            try {
                const response = await getBlogById(id)
                if (response?.status === 200) {
                    setBlog(response.data.data)
                }
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết blog:", error)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchBlogDetail()
        }
    }, [id])

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b7a57" />
            </View>
        )
    }

    if (!blog) {
        return (
            <View style={styles.center}>
                <Text>Không tìm thấy bài viết</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 10 }}>
                    <Text style={{ color: 'blue' }}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header Image */}
                <View style={styles.headerImageContainer}>
                    <Image
                        source={{ uri: blog.image || "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800" }}
                        style={styles.headerImage}
                        resizeMode="cover"
                    />
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <View style={styles.contentContainer}>
                    {/* Category */}
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{blog.category || "BLOG"}</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{blog.title}</Text>

                    {/* Metadata */}
                    <View style={styles.metadataRow}>
                        <View style={styles.authorInfo}>
                            <Ionicons name="person-circle-outline" size={18} color="#718096" />
                            <Text style={styles.authorName}>{blog.author || "FurniMart Team"}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.readTime}>
                            <Ionicons name="time-outline" size={16} color="#718096" />
                            <Text style={styles.readTimeText}>{blog.readTime || "5 phút đọc"}</Text>
                        </View>
                    </View>

                    {/* Content Body */}
                    <Text style={styles.contentBody}>
                        {blog.content || blog.excerpt || "Nội dung đang được cập nhật..."}
                    </Text>


                    {/* Related Tags (Mock) */}
                    <View style={styles.tagsContainer}>
                        {['Tips', 'Nội thất', '2025'].map((tag, index) => (
                            <View key={index} style={styles.tagChip}>
                                <Text style={styles.tagText}>#{tag}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },

    headerImageContainer: {
        position: 'relative',
        height: 250,
        width: '100%',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: '#fff',
        marginTop: -30, // Overlap the image slightly
    },

    categoryBadge: {
        backgroundColor: "#E6FFFA",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    categoryText: {
        color: "#2F855A",
        fontSize: 12,
        fontWeight: "700",
        textTransform: 'uppercase',
    },

    title: {
        fontSize: 26,
        fontWeight: "800",
        color: "#1A202C",
        lineHeight: 34,
        marginBottom: 15,
    },

    metadataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    authorName: {
        fontSize: 14,
        color: "#4A5568",
        fontWeight: "500",
    },
    divider: {
        width: 1,
        height: 14,
        backgroundColor: "#CBD5E0",
        marginHorizontal: 15,
    },
    readTime: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readTimeText: {
        fontSize: 14,
        color: "#718096",
    },

    contentBody: {
        fontSize: 16,
        lineHeight: 26,
        color: "#2D3748",
        marginBottom: 30,
    },

    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
    },
    tagChip: {
        backgroundColor: '#F7FAFC',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    tagText: {
        color: '#718096',
        fontSize: 14,
    },
}) 
