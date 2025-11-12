"use client";

import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client"; // ✅ نحتفظ بالاتصال الأصلي
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Image as ImageIcon,
  Trash2,
  Edit,
  Loader2,
  Search,
  Upload,
  FolderTree,
  PlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

export default function ManageImages() {
  const CLOUD_NAME = "dufjbywcm";
  const UPLOAD_PRESET = "kalimat-allah_uploads";

  const { toast } = useToast();
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [categories, setCategories] = useState([]); // ✅ الفئات من قاعدة البيانات
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("الجميع");
  const [editingImage, setEditingImage] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [category, setCategory] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // 🧩 تحميل الصور والفئات
  useEffect(() => {
    checkAdminAndLoadAll();
  }, []);

  useEffect(() => {
    filterImages();
  }, [searchTerm, activeTab, images]);

  const checkAdminAndLoadAll = async () => {
    try {
      const user = await base44.auth.me();
      setIsAdmin(user.role === "admin");

      if (user.role !== "admin") {
        setIsLoading(false);
        return;
      }

      await Promise.all([loadImages(), loadCategories()]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadImages = async () => {
    const res = await base44.entities.images.list("-created_date", 1000);
    setImages(res);
  };

  const loadCategories = async () => {
    try {
      const res = await base44.entities.categories.list("-created_date", 1000);
      setCategories(res);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  // 🔍 تصفية الصور
  const filterImages = () => {
    let filtered = images;

    if (activeTab !== "الجميع") {
      filtered = filtered.filter((img) => img.category === activeTab);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (img) =>
          img.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          img.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          img.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          img.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredImages(filtered);
  };

  // 🟢 رفع صور متعددة
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setPreviewFiles(files);
  };

  const handleUpload = async () => {
    if (previewFiles.length === 0) {
      toast({ title: "⚠️ اختر صورًا أولاً" });
      return;
    }
    if (!category) {
      toast({ title: "⚠️ اختر فئة لوضع الصور فيها" });
      return;
    }

    setUploading(true);

    try {
      for (const file of previewFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder", `kalimat/${category}`);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();

        if (data.secure_url) {
          await base44.entities.images.create({
            url: data.secure_url,
            title: file.name,
            description: "",
            file_size: file.size,
            width: data.width,
            height: data.height,
            category: category,
          });
        }
      }

      toast({
        title: "✅ تم الرفع بنجاح",
        description: `تم رفع الصور إلى فئة "${category}"`,
        className: "bg-green-100 text-green-800",
      });

      setPreviewFiles([]);
      checkAdminAndLoadAll();
    } catch (error) {
      console.error("Error uploading:", error);
      toast({
        title: "❌ فشل الرفع",
        description: "حدث خطأ أثناء رفع الصور",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // ✏️ تعديل الصور
  const handleEdit = (image) => {
    setEditingImage({ ...image });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      await base44.entities.images.update(editingImage.id, {
        title: editingImage.title,
        description: editingImage.description,
        category: editingImage.category,
      });
      toast({ title: "✅ تم تحديث بيانات الصورة" });
      setShowEditDialog(false);
      checkAdminAndLoadAll();
    } catch (error) {
      console.error("Error updating:", error);
      toast({ title: "❌ فشل التحديث", variant: "destructive" });
    }
  };

  // 🗑️ حذف الصور
  const handleDelete = async (imageId) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;
    try {
      await base44.entities.images.delete(imageId);
      toast({ title: "✅ تم حذف الصورة" });
      checkAdminAndLoadAll();
    } catch (error) {
      console.error("Error deleting:", error);
      toast({ title: "❌ فشل الحذف", variant: "destructive" });
    }
  };

  // 📋 نسخ الرابط
  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast({ title: "✅ تم النسخ", description: "تم نسخ رابط الصورة" });
  };

  // 🧩 إدارة الفئات
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({ title: "⚠️ أدخل اسم الفئة" });
      return;
    }
    try {
      await base44.entities.categories.create({
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
      });
      toast({ title: "✅ تمت إضافة الفئة بنجاح" });
      setNewCategory({ name: "", description: "" });
      loadCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      toast({ title: "❌ فشل إضافة الفئة", variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("هل تريد حذف هذه الفئة؟")) return;
    try {
      await base44.entities.categories.delete(id);
      toast({ title: "✅ تم حذف الفئة" });
      loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({ title: "❌ فشل حذف الفئة", variant: "destructive" });
    }
  };

  // 🌀 تحميل مبدئي
  if (isLoading)
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );

  if (!isAdmin)
    return (
      <div className="p-6 max-w-2xl mx-auto mt-10">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-700 mb-2">⛔ غير مصرح</h2>
            <p className="text-red-600">هذه الصفحة متاحة للمسؤولين فقط</p>
          </CardContent>
        </Card>
      </div>
    );

  // 🖼️ واجهة الصفحة
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        {/* 🏷️ رأس الصفحة */}
        <div className="flex items-center gap-3 mb-6">
          <ImageIcon className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold gradient-text">إدارة الصور والفئات</h1>
            <p className="text-foreground/70">
              رفع وتعديل وحذف الصور مع إدارة الفئات من قاعدة البيانات
            </p>
          </div>
        </div>

        {/* 📤 رفع الصور */}
        <Card>
          <CardHeader>
            <CardTitle>📁 رفع صور حسب الفئة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full md:w-1/3">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input type="file" multiple accept="image/*" onChange={handleFileChange} />
            </div>

            {previewFiles.length > 0 && (
              <div className="grid md:grid-cols-3 gap-4">
                {previewFiles.map((file, i) => (
                  <div key={i} className="border rounded-lg p-2">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded"
                    />
                    <p className="text-sm mt-2 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            )}

            <Button onClick={handleUpload} disabled={uploading} className="w-full">
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" /> رفع الصور
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 🔍 البحث */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Search className="w-5 h-5 text-foreground/50" />
            <Input
              placeholder="ابحث في الصور..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Badge variant="outline">{filteredImages.length} صورة</Badge>
          </CardContent>
        </Card>

        {/* 🧭 تبويبات الفئات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-2 mb-6">
            <TabsTrigger value="الجميع">الجميع</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.name}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredImages.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-foreground/70">لا توجد صور في هذه الفئة</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredImages.map((image) => (
                  <motion.div key={image.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48 bg-gray-100">
                        <img
                          src={image.url}
                          alt={image.title || "صورة"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-lg truncate">
                            {image.title || "بدون عنوان"}
                          </h3>
                          {image.category && (
                            <Badge variant="secondary" className="text-xs">
                              <FolderTree className="w-3 h-3 mr-1 inline" /> {image.category}
                            </Badge>
                          )}
                        </div>
                        {image.description && (
                          <p className="text-sm text-foreground/70 mb-3 line-clamp-2">
                            {image.description}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button onClick={() => copyToClipboard(image.url)} size="sm" variant="outline" className="flex-1">
                            نسخ الرابط
                          </Button>
                          <Button onClick={() => handleEdit(image)} size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => handleDelete(image.id)} size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 🧩 قسم إدارة الفئات */}
        <Card className="mt-10">
          <CardHeader>
            <CardTitle>🧩 إدارة الفئات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                placeholder="اسم الفئة الجديدة"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
              <Input
                placeholder="وصف الفئة (اختياري)"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
              <Button onClick={handleAddCategory}>
                <PlusCircle className="w-4 h-4 mr-1" /> إضافة
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <Card key={cat.id} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-xs text-gray-500">{cat.description}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(cat.id)}>
                    حذف
                  </Button>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ✏️ نافذة التعديل */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل بيانات الصورة</DialogTitle>
            </DialogHeader>
            {editingImage && (
              <div className="space-y-4">
                <img
                  src={editingImage.url}
                  alt="معاينة"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <Input
                  value={editingImage.title || ""}
                  onChange={(e) =>
                    setEditingImage({ ...editingImage, title: e.target.value })
                  }
                  placeholder="عنوان الصورة"
                />
                <Textarea
                  value={editingImage.description || ""}
                  onChange={(e) =>
                    setEditingImage({ ...editingImage, description: e.target.value })
                  }
                  placeholder="وصف الصورة"
                  rows={3}
                />
                <Select
                  value={editingImage.category || ""}
                  onValueChange={(v) =>
                    setEditingImage({ ...editingImage, category: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                                        {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSaveEdit}>
                حفظ التعديلات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
