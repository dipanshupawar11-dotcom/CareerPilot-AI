const supabase = require("../config/supabase");

// =========================================================
// SAVE / UPDATE RESUME
// =========================================================

const createResume = async (req, res) => {
  try {
    const {
      user_id,

      name,
      email,
      phone,
      location,

      linkedin,
      github,
      portfolio,

      summary,
      education,
      skills,
      projects,
      experience,
      certifications,
    } = req.body;

    // =======================================================
    // USER ID REQUIRED
    // =======================================================

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    // =======================================================
    // PREPARE RESUME DATA
    // =======================================================

    const resumeData = {
      user_id,

      name: name || "",
      email: email || "",
      phone: phone || "",
      location: location || "",

      linkedin: linkedin || "",
      github: github || "",
      portfolio: portfolio || "",

      summary: summary || "",
      education: education || "",
      skills: skills || "",
      projects: projects || "",
      experience: experience || "",
      certifications: certifications || "",

      updated_at: new Date().toISOString(),
    };

    console.log("====================================");
    console.log("SAVING RESUME");
    console.log("USER ID:", user_id);
    console.log("====================================");

    // =======================================================
    // UPSERT
    // =======================================================

    const {
      data,
      error,
    } = await supabase
      .from("resumes")
      .upsert(resumeData, {
        onConflict: "user_id",
      })
      .select()
      .single();

    // =======================================================
    // SUPABASE ERROR
    // =======================================================

    if (error) {
      console.error(
        "Supabase Save Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // =======================================================
    // SUCCESS
    // =======================================================

    console.log(
      "Resume saved successfully:",
      data
    );

    return res.status(200).json({
      success: true,
      message: "Resume saved successfully",
      data,
    });

  } catch (error) {

    console.error(
      "Create Resume Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save resume",
    });
  }
};

// =========================================================
// GET RESUME
// =========================================================

const getResume = async (req, res) => {
  try {
    const userId = req.query.user_id;

    // =======================================================
    // USER ID REQUIRED
    // =======================================================

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    console.log("====================================");
    console.log("GET RESUME");
    console.log("USER ID:", userId);
    console.log("====================================");

    // =======================================================
    // FETCH RESUME
    // =======================================================

    const {
      data,
      error,
    } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // =======================================================
    // SUPABASE ERROR
    // =======================================================

    if (error) {
      console.error(
        "Supabase Fetch Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // =======================================================
    // NO RESUME
    // =======================================================

    if (!data) {
      console.log(
        "No resume found for user:",
        userId
      );

      return res.status(404).json({
        success: false,
        message: "No resume found",
      });
    }

    // =======================================================
    // SUCCESS
    // =======================================================

    console.log(
      "Resume fetched successfully"
    );

    return res.status(200).json({
      success: true,
      message: "Resume fetched successfully",
      data,
    });

  } catch (error) {

    console.error(
      "Get Resume Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume",
    });
  }
};

// =========================================================
// DELETE RESUME
// =========================================================

const deleteResume = async (req, res) => {
  try {
    const userId = req.query.user_id;

    // =======================================================
    // USER ID REQUIRED
    // =======================================================

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    console.log("====================================");
    console.log("DELETE RESUME");
    console.log("USER ID:", userId);
    console.log("====================================");

    // =======================================================
    // DELETE FROM SUPABASE
    // =======================================================

    const {
      error,
    } = await supabase
      .from("resumes")
      .delete()
      .eq("user_id", userId);

    // =======================================================
    // DELETE ERROR
    // =======================================================

    if (error) {
      console.error(
        "Supabase Delete Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // =======================================================
    // SUCCESS
    // =======================================================

    console.log(
      "Resume deleted successfully for:",
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });

  } catch (error) {

    console.error(
      "Delete Resume Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete resume",
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  createResume,
  getResume,
  deleteResume,
};