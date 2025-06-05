import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StudentClassDetailPage from "./pages/StudentClassDetailPage";
import StudentLessonAssignmentsPage from "./pages/StudentLessonAssignmentsPage";
import StudentSubmissionDetailPage from "./pages/StudentSubmissionDetailPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherClassDetailPage from "./pages/TeacherClassDetailPage";
import CreateEnrollmentPage from "./pages/CreateEnrollmentPage";
import CreateLessonPage from "./pages/CreateLessonPage";
import LessonAssignmentsPage from "./pages/LessonAssignmentsPage";
import CreateAssignmentPage from "./pages/CreateAssignmentPage";
import AssignmentSubmissionsPage from "./pages/AssignmentSubmissionsPage";
import TeacherSubmissionDetailPage from "./pages/TeacherSubmissionDetailPage";
import CoursesPage from "./pages/CoursesPage";
import TeachersPage from "./pages/TeachersPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import EditProfile from "./pages/profile/EditProfile";
import ClassDetailPage from "./pages/ClassDetailPage";
import CourseDetailPage from '@/pages/CourseDetailPage';
import UserDetailPage from '@/pages/UserDetailPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/class/:classId" element={<ClassDetailPage />} />
          <Route path="/admin/course/:courseId" element={<CourseDetailPage />} />
          <Route path="/admin/user/:userId" element={<UserDetailPage />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/class/:classId" element={<StudentClassDetailPage />} />
          <Route path="/student/lesson/:lessonId/assignments" element={<StudentLessonAssignmentsPage />} />
          <Route path="/student/submission/:submissionId" element={<StudentSubmissionDetailPage />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/class/:classId" element={<TeacherClassDetailPage />} />
          <Route path="/teacher/class/:classId/create-enrollment" element={<CreateEnrollmentPage />} />
          <Route path="/teacher/class/:classId/create-lesson" element={<CreateLessonPage />} />
          <Route path="/teacher/lesson/:lessonId/assignments" element={<LessonAssignmentsPage />} />
          <Route path="/teacher/lesson/:lessonId/create-assignment" element={<CreateAssignmentPage />} />
          <Route path="/teacher/assignment/:assignmentId/submissions/:status" element={<AssignmentSubmissionsPage />} />
          <Route path="/teacher/submission/:submissionId" element={<TeacherSubmissionDetailPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
