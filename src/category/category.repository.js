import Categories from "../../models/category.mode.js"
import SubCategories from "../../models/subCategory.js"
import Fuse from 'fuse.js'

// find all categories
const findAllCategories = async (page, limit, column, sortDirection, filter_search, search) => {
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)

  const queryOptions = {
    status_category: true
  }

  if (search) {
    let searchQuery = { $regex: new RegExp(search, 'i') }
    if (filter_search === 'title' || filter_search === 'slug') {
      queryOptions[filter_search] = searchQuery
      queryOptions['status_category'] = true
    } else {
      queryOptions = {
        $or: [
          { 'title': searchQuery },
          { 'slug': searchQuery },
        ]
      }
      queryOptions['status_category'] = true
    }
  }

  let findCategories = await Categories.aggregate([
    {
      $match: queryOptions
    },
    {
      $sort: {
        [column]: sortDirection === 'desc' ? -1 : 1
      }
    },
    {
      $facet: {
        data: [
          {
            $project: {
              _id: 1,
              title: 1,
              slug: 1,
              created_at: 1
            }
          }
        ],
        totalRows: [
          {
            $count: 'count'
          }
        ]
      }
    }
  ]);

  let totalRows = 0;
  const skipCount = limitInt ? pageInt * limitInt : 0
  findCategories[0].data = findCategories[0].data.slice(skipCount, skipCount + limitInt)
  const totalPage = Math.ceil(totalRows / limitInt)

  return {
    data: findCategories[0].data,
    page: pageInt,
    limit: limitInt || totalRows,
    totalRows,
    totalPage
  }
}

// find category by id
const findCategoryById = async (id) => {
  const category = await Categories.findById(id)
  return category
}

// find category by title
const findCategoryByTitle = async (categoryTitle) => {
  const category = await Categories.findOne({ title: categoryTitle, status_category: true })
  return category
}

// find category by slug
const findCategoryBySlug = async (categorySlug) => {
  const category = await Categories.findOne({ slug: categorySlug, status_category: true })
  return category
}

// insert new category
const insertCategory = async (data) => {
  const category = await new Categories({
    title: data.newCategoryData.title,
    slug: data.newCategoryData.slug,
    created_by: data.user.email,
    updated_by: data.user.email
  }).save()
  return category
}

// edit category
const editCategory = async (id, categoryData) => {
  const category = await Categories.updateOne(
    { _id: id }, {
    $set: {
      title: categoryData.title,
      slug: categoryData.slug
    }
  })
  return category
}

// delete category
const deleteCategoryById = async (data) => {
  await Categories.findByIdAndUpdate({ _id: data.categoryId }, {
    $set: { status_category: 0, deleted_by: data.user.email, deletedAt: Date.now() }
  })
  await SubCategories.updateMany({ id_category: data.categoryId }, {
    $set: { status_sub_category: 0, deleted_by: data.user.email, deletedAt: Date.now() }
  })
}

export const categoryRepository = {
  findAllCategories,
  findCategoryByTitle,
  findCategoryById,
  findCategoryBySlug,
  insertCategory,
  editCategory,
  deleteCategoryById,
} 